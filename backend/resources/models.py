import uuid
from django.db import models
from django.conf import settings

from apps.tag.models import Tag


class Resource(models.Model):
    RESOURCE_TYPES = [
        ('textbook', 'Textbook'),
        ('article', 'Article'),
        ('video', 'Video'),
        ('website', 'Website'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_resources'
    )
    title = models.CharField(max_length=255)
    url = models.URLField()
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES, blank=True, null=True)
    # Was a free-text CharField (hence the fake "algorithms" values in the
    # frontend). Now a real link into the shared taxonomy. Resources should
    # only ever point at a leaf-level tag, not a category/subcategory -
    # enforced in the serializer since a plain FK can't express that.
    tag = models.ForeignKey(
        Tag,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resources',
        limit_choices_to={'level': Tag.Level.TAG},
    )
    net_votes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-net_votes', '-created_at']

    def __str__(self):
        return self.title


class Vote(models.Model):
    VOTE_VALUES = [(1, 'Upvote'), (-1, 'Downvote')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resource_votes'
    )
    value = models.SmallIntegerField(choices=VOTE_VALUES)

    class Meta:
        unique_together = ('resource', 'user')

    def __str__(self):
        return f"{self.user} voted {self.value} on {self.resource}"