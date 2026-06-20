import uuid
from django.db import models
from django.conf import settings


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_id = models.UUIDField()
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_chatmessage'
        ordering = ['sent_at']

    def __str__(self):
        return f"{self.sender} in group {self.group_id}: {self.content[:30]}"