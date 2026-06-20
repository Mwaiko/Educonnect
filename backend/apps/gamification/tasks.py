"""
Celery tasks for the gamification app.

Register in settings:
    CELERY_BEAT_SCHEDULE = {
        "finalize-streaks-midnight": {
            "task": "gamification.tasks.finalize_streaks",
            "schedule": crontab(hour=0, minute=0),
        },
    }
"""
from celery import shared_task


@shared_task
def finalize_streaks():
    """
    Runs at midnight. Marks streak_count=0 for users with no activity today.
    """
    from .services import finalize_inactive_streaks
    finalize_inactive_streaks()
