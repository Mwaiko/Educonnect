"""
Utility helpers for password reset tokens.
Uses a simple DB-backed token (no external dependency beyond Django).
For production, replace email sending with your SMTP / email service.
"""

import secrets
from datetime import timedelta

from django.db import models
from django.utils import timezone


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    EXPIRY_HOURS = 1

    class Meta:
        db_table = "users_passwordresettoken"

    @classmethod
    def create_for_user(cls, user):
        # Invalidate any existing unused tokens for this user
        cls.objects.filter(user=user, used=False).update(used=True)
        token = secrets.token_urlsafe(48)
        return cls.objects.create(user=user, token=token)

    @property
    def is_valid(self):
        expiry = self.created_at + timedelta(hours=self.EXPIRY_HOURS)
        return not self.used and timezone.now() < expiry

    def __str__(self):
        return f"ResetToken({self.user.email}, used={self.used})"
