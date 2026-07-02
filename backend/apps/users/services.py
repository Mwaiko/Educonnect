"""
Automatic Student <-> Expert Solver role engine.

- An Expert Solver whose recent answers are getting net-downvoted gets
  demoted back to Student.
- A Student whose recent answers are frequently accepted/endorsed gets
  promoted to Expert Solver.

Triggered synchronously, right when a vote/endorsement/acceptance crosses
the threshold (called from apps.forum.views.AnswerViewSet), not on a
schedule — so it's a plain function call, not a Celery task.

All thresholds are overridable via Django settings so they can be tuned
without a deploy-time code change:

    ROLE_ENGINE_SAMPLE_SIZE      - how many of the user's most recent
                                    answers to look at (default 12)
    ROLE_ENGINE_MIN_ANSWERS      - minimum answers on record before the
                                    engine will judge someone at all
                                    (default 10)
    ROLE_ENGINE_DEMOTE_RATIO     - fraction of the sample with net
                                    votes < 0 that triggers demotion
                                    (default 0.5, i.e. half or more)
    ROLE_ENGINE_PROMOTE_RATIO    - fraction of the sample that's
                                    accepted/endorsed that triggers
                                    promotion (default 0.5)
    ROLE_ENGINE_COOLDOWN_DAYS    - after a role change, how long before
                                    this user is eligible to be
                                    re-evaluated (default 14) — prevents
                                    flapping from a small burst of votes
"""

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import RoleChangeLog

SAMPLE_SIZE = getattr(settings, "ROLE_ENGINE_SAMPLE_SIZE", 12)
MIN_ANSWERS_FOR_EVAL = getattr(settings, "ROLE_ENGINE_MIN_ANSWERS", 10)
DEMOTE_NEGATIVE_RATIO = getattr(settings, "ROLE_ENGINE_DEMOTE_RATIO", 0.5)
PROMOTE_POSITIVE_RATIO = getattr(settings, "ROLE_ENGINE_PROMOTE_RATIO", 0.5)
COOLDOWN = timedelta(days=getattr(settings, "ROLE_ENGINE_COOLDOWN_DAYS", 14))

# Only these roles are managed automatically. Admins, staff, or any other
# role are left alone even if they happen to author forum answers.
_ELIGIBLE_ROLES = ("student", "expert_solver")


def evaluate_role_change(user):
    """Check whether `user`'s recent answer performance crosses the
    promotion/demotion threshold, and flip their role + log it if so.

    Safe to call after any vote/endorsement/acceptance change on any of
    that user's answers — it's a cheap no-op unless there's enough of a
    track record and the user is actually eligible.

    Returns the new role string if a change was made, else None.
    """
    if user is None or not getattr(user, "is_active", True):
        return None
    if user.role not in _ELIGIBLE_ROLES:
        return None
    if _in_cooldown(user):
        return None

    answers = _recent_answers(user)
    if len(answers) < MIN_ANSWERS_FOR_EVAL:
        return None  # not enough of a track record to judge yet

    total = len(answers)

    if user.role == "expert_solver":
        negative_count = sum(1 for a in answers if a.net_vote_count < 0)
        if negative_count / total >= DEMOTE_NEGATIVE_RATIO:
            return _change_role(user, "student", RoleChangeLog.Reason.AUTO_DEMOTED)

    elif user.role == "student":
        positive_count = sum(1 for a in answers if a.is_accepted or a.is_endorsed)
        if positive_count / total >= PROMOTE_POSITIVE_RATIO:
            return _change_role(user, "expert_solver", RoleChangeLog.Reason.AUTO_PROMOTED)

    return None


def _in_cooldown(user):
    last_change = (
        RoleChangeLog.objects.filter(user=user).order_by("-created_at").first()
    )
    return bool(last_change and timezone.now() - last_change.created_at < COOLDOWN)


def _recent_answers(user):
    # Deferred import: apps.forum.views imports evaluate_role_change from
    # this module at module load time, so importing apps.forum.models at
    # *this* module's load time (top of file) would risk a circular
    # import while Django is still populating the app registry. Importing
    # it lazily, inside the function, sidesteps that entirely.
    from apps.forum.models import Answer

    return list(
        Answer.objects.filter(author=user)
        .only("id", "upvote_count", "downvote_count", "is_accepted", "is_endorsed")
        .order_by("-created_at")[:SAMPLE_SIZE]
    )


def _change_role(user, new_role, reason):
    previous_role = user.role
    user.role = new_role
    user.save(update_fields=["role"])

    RoleChangeLog.objects.create(
        user=user, previous_role=previous_role, new_role=new_role, reason=reason
    )

    # Best-effort notification; the role change itself has already been
    # committed above, so a missing/broken notifications module shouldn't
    # roll anything back.
    try:
        from notifications.services import notify_role_changed

        notify_role_changed(user, previous_role, new_role)
    except ImportError:  # pragma: no cover - notifications module not yet merged
        pass

    return new_role