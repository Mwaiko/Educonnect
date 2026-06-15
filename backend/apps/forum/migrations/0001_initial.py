import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Tag",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=80, unique=True)),
            ],
            options={
                "db_table": "forum_tag",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("body", models.TextField()),
                ("is_resolved", models.BooleanField(default=False)),
                ("upvote_count", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="questions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "forum_question",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Answer",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("body", models.TextField()),
                ("is_endorsed", models.BooleanField(default=False)),
                ("is_accepted", models.BooleanField(default=False)),
                ("upvote_count", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answers", to=settings.AUTH_USER_MODEL)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answers", to="forum.question")),
            ],
            options={
                "db_table": "forum_answer",
                "ordering": ["-is_accepted", "-is_endorsed", "-upvote_count", "created_at"],
            },
        ),
        migrations.CreateModel(
            name="QuestionTag",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="forum.question")),
                ("tag", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="forum.tag")),
            ],
            options={
                "db_table": "forum_question_tags",
            },
        ),
        migrations.AddField(
            model_name="question",
            name="tags",
            field=models.ManyToManyField(blank=True, related_name="questions", through="forum.QuestionTag", to="forum.tag"),
        ),
        migrations.CreateModel(
            name="QuestionUpvote",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="upvotes", to="forum.question")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="question_upvotes", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "forum_question_upvote",
            },
        ),
        migrations.CreateModel(
            name="AnswerUpvote",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("answer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="upvotes", to="forum.answer")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="answer_upvotes", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "forum_answer_upvote",
            },
        ),
        migrations.AddIndex(
            model_name="question",
            index=models.Index(fields=["-created_at"], name="forum_quest_created_idx"),
        ),
        migrations.AddIndex(
            model_name="question",
            index=models.Index(fields=["-upvote_count"], name="forum_quest_upvote_idx"),
        ),
        migrations.AddIndex(
            model_name="question",
            index=models.Index(fields=["is_resolved"], name="forum_quest_resolv_idx"),
        ),
        migrations.AddIndex(
            model_name="answer",
            index=models.Index(fields=["question", "-created_at"], name="forum_ans_q_created_idx"),
        ),
        migrations.AddConstraint(
            model_name="questiontag",
            constraint=models.UniqueConstraint(fields=("question", "tag"), name="unique_question_tag"),
        ),
        migrations.AddConstraint(
            model_name="questionupvote",
            constraint=models.UniqueConstraint(fields=("question", "user"), name="unique_question_upvote"),
        ),
        migrations.AddConstraint(
            model_name="answerupvote",
            constraint=models.UniqueConstraint(fields=("answer", "user"), name="unique_answer_upvote"),
        ),
    ]
