"""
Gamification service layer.
All business logic lives here; views are thin wrappers.
"""
from datetime import date, timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Sum

from .models import PointTransaction, StreakRecord

# ---------------------------------------------------------------------------
# Point values — override in settings if needed
# ---------------------------------------------------------------------------
POINT_VALUES = {
    PointTransaction.EventType.POST_QUESTION: getattr(settings, "POINTS_POST_QUESTION", 5),
    PointTransaction.EventType.SUBMIT_ANSWER: getattr(settings, "POINTS_SUBMIT_ANSWER", 10),
    PointTransaction.EventType.ANSWER_ENDORSED: getattr(settings, "POINTS_ANSWER_ENDORSED", 20),
    PointTransaction.EventType.ANSWER_ACCEPTED: getattr(settings, "POINTS_ANSWER_ACCEPTED", 30),
    PointTransaction.EventType.SUBMIT_RESOURCE: getattr(settings, "POINTS_SUBMIT_RESOURCE", 5),
    PointTransaction.EventType.RESOURCE_MILESTONE: getattr(settings, "POINTS_RESOURCE_MILESTONE", 15),
    PointTransaction.EventType.ATTEND_SESSION: getattr(settings, "POINTS_ATTEND_SESSION", 10),
}


# ---------------------------------------------------------------------------
# Points
# ---------------------------------------------------------------------------

@transaction.atomic
def award_points(user, event_type: str, description: str = "") -> PointTransaction:
    """
    Create a PointTransaction and update users_user.total_points.
    Returns the created transaction.
    """
    points = POINT_VALUES[event_type]
    tx = PointTransaction.objects.create(
        user=user,
        event_type=event_type,
        points_awarded=points,
        description=description,
    )
    # Increment the denormalised total stored on the user model
    user.__class__.objects.filter(pk=user.pk).update(
        total_points=Sum("point_transactions__points_awarded")  # recalculate
    )
    # Simpler approach: just increment
    user.__class__.objects.filter(pk=user.pk).update(
        total_points=models_total(user) 
    )
    return tx


def models_total(user) -> int:
    result = PointTransaction.objects.filter(user=user).aggregate(t=Sum("points_awarded"))
    return result["t"] or 0


def get_total_points(user) -> int:
    return models_total(user)


# ---------------------------------------------------------------------------
# Streak
# ---------------------------------------------------------------------------

@transaction.atomic
def record_participation(user, today: date | None = None) -> StreakRecord:
    """
    Call whenever a user performs a qualifying participation event.
    Creates/updates today's StreakRecord and recalculates the running streak.
    Returns today's StreakRecord.
    """
    if today is None:
        today = date.today()

    record, created = StreakRecord.objects.get_or_create(
        user=user,
        date=today,
        defaults={"events_count": 0, "streak_count": 1},
    )
    record.events_count += 1

    # Determine streak_count
    yesterday = today - timedelta(days=1)
    try:
        yesterday_record = StreakRecord.objects.get(user=user, date=yesterday)
        if yesterday_record.events_count > 0:
            record.streak_count = yesterday_record.streak_count + 1
        else:
            record.streak_count = 1
    except StreakRecord.DoesNotExist:
        if not created:
            # record existed for today but yesterday is missing → reset
            record.streak_count = 1

    record.save()

    # Persist the current streak on the user model
    user.__class__.objects.filter(pk=user.pk).update(streak_count=record.streak_count)

    return record


def finalize_inactive_streaks(today: date | None = None):
    """
    Celery task body: called at midnight.
    For every user who had no activity today, ensure their streak is reset
    by writing a StreakRecord with events_count=0 and streak_count=0.
    This does NOT overwrite existing records with events.
    """
    from django.contrib.auth import get_user_model

    if today is None:
        today = date.today()

    User = get_user_model()
    active_today = StreakRecord.objects.filter(
        date=today, events_count__gt=0
    ).values_list("user_id", flat=True)

    inactive_users = User.objects.exclude(pk__in=active_today)
    for user in inactive_users:
        StreakRecord.objects.get_or_create(
            user=user,
            date=today,
            defaults={"events_count": 0, "streak_count": 0},
        )
        user.__class__.objects.filter(pk=user.pk).update(streak_count=0)


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

def get_leaderboard(timeframe: str = "all", limit: int = 10):
    """
    Returns a queryset of dicts: [{user_id, username, total_points}, ...]
    timeframe: 'weekly' | 'monthly' | 'all'
    """
    from django.utils import timezone

    qs = PointTransaction.objects.all()

    if timeframe == "weekly":
        since = timezone.now() - timedelta(weeks=1)
        qs = qs.filter(created_at__gte=since)
    elif timeframe == "monthly":
        since = timezone.now() - timedelta(days=30)
        qs = qs.filter(created_at__gte=since)

    return (
        qs.values("user__id", "user__username", "user__first_name", "user__last_name")
        .annotate(total_points=Sum("points_awarded"))
        .order_by("-total_points")[:limit]
    )
