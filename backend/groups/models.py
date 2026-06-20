import uuid
from django.db import models
from django.conf import settings


class StudyGroup(models.Model):
    FORMATION_TYPES = [
        ('automated', 'Automated'),
        ('manual', 'Manual'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    subject_tag = models.CharField(max_length=80, blank=True, null=True)
    formation_type = models.CharField(max_length=20, choices=FORMATION_TYPES, default='manual')
    max_members = models.PositiveIntegerField(default=8)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_groups'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'groups_studygroup'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.memberships.count()

    @property
    def is_full(self):
        return self.memberships.count() >= self.max_members


class Membership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        StudyGroup,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'groups_membership'
        unique_together = ('group', 'user')

    def __str__(self):
        return f"{self.user} in {self.group}"


class MeetingLink(models.Model):
    PROVIDERS = [
        ('google_meet', 'Google Meet'),
        ('zoom', 'Zoom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        StudyGroup,
        on_delete=models.CASCADE,
        related_name='meeting_links'
    )
    provider = models.CharField(max_length=20, choices=PROVIDERS)
    meeting_url = models.TextField()
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'groups_meetinglink'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.provider} link for {self.group}"