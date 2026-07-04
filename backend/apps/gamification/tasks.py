
from celery import shared_task


@shared_task
def finalize_streaks():
    """
    Runs at midnight. Marks streak_count=0 for users with no activity today.
    """
    from .services import finalize_inactive_streaks
    finalize_inactive_streaks()
