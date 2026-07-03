"""
Management command to seed the database with realistic fake data for testing.

USAGE
-----
    python manage.py seed_data
    python manage.py seed_data --users 500 --questions 2000 --answers 6000
    python manage.py seed_data --flush          # wipe previously-seeded data first

WHERE TO PUT THIS FILE
-----------------------
Django management commands must live at:
    <some_app>/management/commands/seed_data.py

e.g. apps/forum/management/commands/seed_data.py

You need empty __init__.py files in both `management/` and `commands/`
folders if they don't already exist:
    apps/forum/management/__init__.py
    apps/forum/management/commands/__init__.py

ADJUST THE IMPORTS BELOW to match your actual project layout (app labels /
python paths) if they differ from what's assumed here.

DEPENDENCY
----------
    pip install Faker

NOTES ON DESIGN
----------------
- Assumes the Tag table is already seeded (categories/subcategories/leaf
  tags) since this script only reads from it, never writes to it.
- Respects business rules found in your models' docstrings:
    * User.subjects -> subcategory-level tags only
    * Question.tags / Resource.tag / StudyGroup.subject_tag -> leaf tags only
    * Exactly one accepted Answer per Question (roughly)
    * AnswerUpvote / AnswerDownvote are mutually exclusive per user (this
      script doesn't force that in the DB, since your codebase already
      notes it's enforced at the view layer, not via constraint — but it
      biases voters so double-voting is rare)
- Uses bulk_create with ignore_conflicts=True for high-volume tables to
  stay fast and to gracefully skip accidental unique-constraint collisions
  (works on Postgres and SQLite).
- Denormalized counters (Question.upvote_count, Answer.upvote_count /
  downvote_count, Resource.net_votes, User.streak_count / points_total /
  rank_position) are synced AFTER the underlying vote/event rows are
  created, so they stay consistent with the detail rows.
- All seeded users share the password below — handy for logging in as any
  of them while testing.
"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from faker import Faker

# ---- Adjust these imports to match your project layout ----
from apps.users.models import User, RoleChangeLog, GoogleOAuthToken
from apps.tag.models import Tag
from apps.forum.models import (
    Question,
    Answer,
    QuestionUpvote,
    AnswerUpvote,
    AnswerDownvote,
    AnswerResource,
)
from resources.models import Resource, Vote as ResourceVote
from groups.models import StudyGroup, Membership, MeetingLink
from notifications.models import Notification
from apps.gamification.models import StreakRecord, PointTransaction
# -------------------------------------------------------------

fake = Faker()

PASSWORD = "TestPass123!"


class Command(BaseCommand):
    help = "Seed the database with fake data for testing/development."

    def add_arguments(self, parser):
        parser.add_argument("--users", type=int, default=200)
        parser.add_argument("--questions", type=int, default=600)
        parser.add_argument("--answers", type=int, default=2000)
        parser.add_argument("--resources", type=int, default=300)
        parser.add_argument("--groups", type=int, default=40)
        parser.add_argument("--notifications", type=int, default=1000)
        parser.add_argument(
            "--flush",
            action="store_true",
            help=(
                "Delete existing seeded rows (users/questions/answers/etc.) "
                "before seeding. Does NOT touch the Tag table."
            ),
        )

    def handle(self, *args, **opts):
        self.n_users = opts["users"]
        self.n_questions = opts["questions"]
        self.n_answers = opts["answers"]
        self.n_resources = opts["resources"]
        self.n_groups = opts["groups"]
        self.n_notifications = opts["notifications"]

        leaf_tags = list(Tag.objects.leaf_tags())
        subcategory_tags = list(Tag.objects.subcategories())

        if not leaf_tags:
            self.stderr.write(
                "No leaf-level tags found. Seed the Tag table first."
            )
            return

        with transaction.atomic():
            if opts["flush"]:
                self._flush()

            users = self._seed_users(subcategory_tags)
            self._seed_role_change_logs(users)
            questions = self._seed_questions(users, leaf_tags)
            answers = self._seed_answers(users, questions)
            self._seed_question_upvotes(users, questions)
            self._seed_answer_votes(users, answers)
            resources = self._seed_resources(users, leaf_tags)
            self._seed_resource_votes(users, resources)
            self._seed_answer_resources(users, answers, resources)
            groups = self._seed_groups(users, leaf_tags)
            self._seed_memberships(users, groups)
            self._seed_meeting_links(groups)
            self._seed_notifications(users)
            self._seed_streaks(users)
            self._seed_point_transactions(users)

        self.stdout.write(self.style.SUCCESS("Done seeding."))

    # ------------------------------------------------------------------
    def _flush(self):
        self.stdout.write("Flushing existing seeded data...")
        PointTransaction.objects.all().delete()
        StreakRecord.objects.all().delete()
        Notification.objects.all().delete()
        MeetingLink.objects.all().delete()
        Membership.objects.all().delete()
        StudyGroup.objects.all().delete()
        AnswerResource.objects.all().delete()
        ResourceVote.objects.all().delete()
        Resource.objects.all().delete()
        AnswerUpvote.objects.all().delete()
        AnswerDownvote.objects.all().delete()
        QuestionUpvote.objects.all().delete()
        Answer.objects.all().delete()
        Question.objects.all().delete()
        RoleChangeLog.objects.all().delete()
        GoogleOAuthToken.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    # ------------------------------------------------------------------
    def _seed_users(self, subcategory_tags):
        self.stdout.write(f"Seeding {self.n_users} users...")
        users = []
        for i in range(self.n_users):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"
            role = random.choices(
                ["student", "expert_solver"], weights=[0.8, 0.2]
            )[0]
            user = User.objects.create_user(
                email=email,
                password=PASSWORD,
                first_name=first_name,
                last_name=last_name,
                role=role,
                bio=fake.sentence(nb_words=12),
                date_joined=fake.date_time_between(
                    start_date="-2y",
                    end_date="now",
                    tzinfo=timezone.get_current_timezone(),
                ),
            )
            if subcategory_tags:
                user.subjects.set(
                    random.sample(
                        subcategory_tags,
                        k=min(len(subcategory_tags), random.randint(1, 3)),
                    )
                )
            users.append(user)

            if random.random() < 0.1:
                GoogleOAuthToken.objects.create(
                    user=user,
                    access_token=fake.sha256(),
                    refresh_token=fake.sha256(),
                )
        return users

    def _seed_role_change_logs(self, users):
        experts = [u for u in users if u.role == "expert_solver"]
        if not experts:
            return
        for user in random.sample(experts, k=max(1, len(experts) // 2)):
            RoleChangeLog.objects.create(
                user=user,
                previous_role="student",
                new_role="expert_solver",
                reason=RoleChangeLog.Reason.AUTO_PROMOTED,
            )

    # ------------------------------------------------------------------
    def _seed_questions(self, users, leaf_tags):
        self.stdout.write(f"Seeding {self.n_questions} questions...")
        questions = []
        for _ in range(self.n_questions):
            q = Question.objects.create(
                author=random.choice(users),
                title=fake.sentence(nb_words=8).rstrip("."),
                body="\n\n".join(fake.paragraphs(nb=random.randint(1, 4))),
                is_resolved=random.random() < 0.4,
            )
            q.tags.set(random.sample(leaf_tags, k=min(len(leaf_tags), random.randint(1, 4))))
            questions.append(q)
        return questions

    # ------------------------------------------------------------------
    def _seed_answers(self, users, questions):
        self.stdout.write(f"Seeding {self.n_answers} answers...")
        answers = []
        for _ in range(self.n_answers):
            question = random.choice(questions)
            a = Answer.objects.create(
                question=question,
                author=random.choice(users),
                body="\n\n".join(fake.paragraphs(nb=random.randint(1, 3))),
                is_endorsed=random.random() < 0.15,
                is_accepted=False,
            )
            answers.append(a)

        # Give roughly one accepted answer to ~60% of questions that got answers
        by_question = {}
        for a in answers:
            by_question.setdefault(a.question_id, []).append(a)
        for qid, qanswers in by_question.items():
            if random.random() < 0.6:
                chosen = random.choice(qanswers)
                chosen.is_accepted = True
                chosen.save(update_fields=["is_accepted"])
                Question.objects.filter(pk=qid).update(is_resolved=True)

        return answers

    # ------------------------------------------------------------------
    def _seed_question_upvotes(self, users, questions):
        self.stdout.write("Seeding question upvotes...")
        bulk = []
        for q in questions:
            voters = random.sample(users, k=min(len(users), random.randint(0, 25)))
            for u in voters:
                bulk.append(QuestionUpvote(question=q, user=u))
        QuestionUpvote.objects.bulk_create(bulk, ignore_conflicts=True)

        for q in questions:
            count = q.upvotes.count()
            if count:
                Question.objects.filter(pk=q.pk).update(upvote_count=count)

    def _seed_answer_votes(self, users, answers):
        self.stdout.write("Seeding answer up/downvotes...")
        up_bulk, down_bulk = [], []
        for a in answers:
            voters = random.sample(users, k=min(len(users), random.randint(0, 20)))
            split = int(len(voters) * random.uniform(0.6, 0.95))
            upvoters, downvoters = voters[:split], voters[split:]
            for u in upvoters:
                up_bulk.append(AnswerUpvote(answer=a, user=u))
            for u in downvoters:
                down_bulk.append(AnswerDownvote(answer=a, user=u))
        AnswerUpvote.objects.bulk_create(up_bulk, ignore_conflicts=True)
        AnswerDownvote.objects.bulk_create(down_bulk, ignore_conflicts=True)

        for a in answers:
            up = a.upvotes.count()
            down = a.downvotes.count()
            if up or down:
                Answer.objects.filter(pk=a.pk).update(
                    upvote_count=up, downvote_count=down
                )

    # ------------------------------------------------------------------
    def _seed_resources(self, users, leaf_tags):
        self.stdout.write(f"Seeding {self.n_resources} resources...")
        resource_types = [r[0] for r in Resource.RESOURCE_TYPES]
        resources = []
        for _ in range(self.n_resources):
            r = Resource.objects.create(
                submitted_by=random.choice(users),
                title=fake.sentence(nb_words=6).rstrip("."),
                url=fake.url(),
                resource_type=random.choice(resource_types),
                tag=random.choice(leaf_tags),
            )
            resources.append(r)
        return resources

    def _seed_resource_votes(self, users, resources):
        self.stdout.write("Seeding resource votes...")
        bulk = []
        for r in resources:
            voters = random.sample(users, k=min(len(users), random.randint(0, 15)))
            for u in voters:
                bulk.append(
                    ResourceVote(resource=r, user=u, value=random.choice([1, -1]))
                )
        ResourceVote.objects.bulk_create(bulk, ignore_conflicts=True)

        for r in resources:
            net = sum(r.votes.values_list("value", flat=True))
            Resource.objects.filter(pk=r.pk).update(net_votes=net)

    def _seed_answer_resources(self, users, answers, resources):
        self.stdout.write("Seeding answer-resource suggestions...")
        bulk = []
        sample_size = max(1, len(answers) // 3)
        sample_answers = random.sample(answers, k=min(len(answers), sample_size))
        for a in sample_answers:
            # Anyone can suggest a resource under an answer, not just its author —
            # weight toward the answer's author / question's author (most common
            # in practice) but allow other users too, for realism.
            suggester_pool = [a.author, a.question.author] + random.sample(
                users, k=min(len(users), 3)
            )
            for r in random.sample(resources, k=min(len(resources), random.randint(1, 2))):
                bulk.append(
                    AnswerResource(
                        answer=a, resource=r, suggested_by=random.choice(suggester_pool)
                    )
                )
        AnswerResource.objects.bulk_create(bulk, ignore_conflicts=True)

    # ------------------------------------------------------------------
    def _seed_groups(self, users, leaf_tags):
        self.stdout.write(f"Seeding {self.n_groups} study groups...")
        groups = []
        for _ in range(self.n_groups):
            g = StudyGroup.objects.create(
                name=f"{fake.word().capitalize()} Study Group",
                subject_tag=random.choice(leaf_tags),
                formation_type=random.choice(["automated", "manual"]),
                max_members=random.choice([4, 6, 8, 10, 12]),
                created_by=random.choice(users),
            )
            groups.append(g)
        return groups

    def _seed_memberships(self, users, groups):
        self.stdout.write("Seeding group memberships...")
        bulk = []
        for g in groups:
            # The group's creator is always a member of their own group.
            if g.created_by_id:
                bulk.append(Membership(group=g, user=g.created_by))

            # Fill out the rest of the roster (excluding the creator, so we
            # don't try to insert a duplicate (group, user) row).
            other_users = [u for u in users if u.id != g.created_by_id]
            extra_slots = max(0, g.max_members - 1)
            extra_count = min(len(other_users), random.randint(0, extra_slots))
            for u in random.sample(other_users, k=extra_count):
                bulk.append(Membership(group=g, user=u))
        Membership.objects.bulk_create(bulk, ignore_conflicts=True)

    def _seed_meeting_links(self, groups):
        self.stdout.write("Seeding meeting links...")
        bulk = []
        for g in groups:
            for _ in range(random.randint(0, 3)):
                bulk.append(
                    MeetingLink(
                        group=g,
                        provider=random.choice(["google_meet", "zoom"]),
                        meeting_url=fake.url(),
                        scheduled_at=fake.date_time_between(
                            start_date="-1M",
                            end_date="+1M",
                            tzinfo=timezone.get_current_timezone(),
                        ),
                    )
                )
        MeetingLink.objects.bulk_create(bulk)

    # ------------------------------------------------------------------
    def _seed_notifications(self, users):
        self.stdout.write(f"Seeding {self.n_notifications} notifications...")
        types = [t[0] for t in Notification.NOTIFICATION_TYPES]
        bulk = []
        for _ in range(self.n_notifications):
            bulk.append(
                Notification(
                    recipient=random.choice(users),
                    notification_type=random.choice(types),
                    payload={"message": fake.sentence(nb_words=10)},
                    is_read=random.random() < 0.5,
                )
            )
        Notification.objects.bulk_create(bulk)

    # ------------------------------------------------------------------
    def _seed_streaks(self, users):
        self.stdout.write("Seeding streak records...")
        bulk = []
        today = timezone.now().date()
        for u in users:
            days_active = random.randint(0, 30)
            streak = 0
            offsets = sorted(random.sample(range(60), k=min(60, days_active)), reverse=True)
            for offset in offsets:
                streak = streak + 1 if random.random() < 0.7 else 1
                bulk.append(
                    StreakRecord(
                        user=u,
                        date=today - timedelta(days=offset),
                        events_count=random.randint(1, 8),
                        streak_count=streak,
                    )
                )
        StreakRecord.objects.bulk_create(bulk, ignore_conflicts=True)

        for u in users:
            latest = u.streak_records.first()  # Meta.ordering = ["-date"]
            if latest:
                User.objects.filter(pk=u.pk).update(streak_count=latest.streak_count)

    def _seed_point_transactions(self, users):
        self.stdout.write("Seeding point transactions...")
        events = [e[0] for e in PointTransaction.EventType.choices]
        point_map = {
            "post_question": 5,
            "submit_answer": 10,
            "answer_endorsed": 25,
            "answer_accepted": 30,
            "submit_resource": 8,
            "resource_milestone": 15,
            "attend_session": 12,
        }
        bulk = []
        for u in users:
            for _ in range(random.randint(0, 15)):
                event = random.choice(events)
                bulk.append(
                    PointTransaction(
                        user=u,
                        event_type=event,
                        points_awarded=point_map[event],
                        description=fake.sentence(nb_words=6),
                    )
                )
        PointTransaction.objects.bulk_create(bulk)

        for u in users:
            total = (
                u.point_transactions.aggregate(total=Sum("points_awarded"))["total"]
                or 0
            )
            User.objects.filter(pk=u.pk).update(points_total=total)

        # crude leaderboard ranking by total points
        for idx, u in enumerate(User.objects.order_by("-points_total"), start=1):
            User.objects.filter(pk=u.pk).update(rank_position=idx)