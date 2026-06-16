from django.db import models
from django.conf import settings


class StreakRecord(models.Model):
    """Tracks daily participation for streak calculation."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="streak_records",
    )
    date = models.DateField()
    events_count = models.PositiveIntegerField(default=0)
    streak_count = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "gamification_streakrecord"
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} | {self.date} | streak={self.streak_count}"


class PointTransaction(models.Model):
    """Immutable ledger of every point event."""

    class EventType(models.TextChoices):
        POST_QUESTION = "post_question", "Post a Question"
        SUBMIT_ANSWER = "submit_answer", "Submit an Answer"
        ANSWER_ENDORSED = "answer_endorsed", "Answer Endorsed by Expert"
        ANSWER_ACCEPTED = "answer_accepted", "Answer Accepted"
        SUBMIT_RESOURCE = "submit_resource", "Submit a Resource"
        RESOURCE_MILESTONE = "resource_milestone", "Resource Reached 10 Votes"
        ATTEND_SESSION = "attend_session", "Attended Study Group Session"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="point_transactions",
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    points_awarded = models.IntegerField()
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "gamification_pointtransaction"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} | {self.event_type} | +{self.points_awarded}pts"
