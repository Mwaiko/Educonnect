import uuid
from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_answer', 'New Answer'),
        ('answer_endorsed', 'Answer Endorsed'),
        ('answer_accepted', 'Answer Accepted'),
        ('group_formed', 'Group Formed'),
        ('meeting_reminder', 'Meeting Reminder'),
        ('resource_upvote_milestone', 'Resource Upvote Milestone'),
        ('chat_message', 'Chat Message'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    payload = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} for {self.recipient}"