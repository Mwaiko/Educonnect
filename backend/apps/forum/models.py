import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Question(models.Model):
    """forum_question — a posted academic question."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    tags = models.ManyToManyField(
        "tag.Tag", through="QuestionTag", related_name="questions", blank=True
    )
    is_resolved = models.BooleanField(default=False)
    upvote_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "forum_question"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["-upvote_count"]),
            models.Index(fields=["is_resolved"]),
        ]

    def __str__(self):
        return self.title

    @property
    def answer_count(self):
        return self.answers.count()


class QuestionTag(models.Model):
    """forum_question_tags — junction table between questions and tags.

    Only leaf-level (Tag.Level.TAG) tags should ever be attached to a
    question. This is enforced primarily by QuestionCreateSerializer, whose
    `tags` field's queryset is restricted to level=TAG — that is the real
    source of truth. `clean()` below is defense-in-depth only: M2M
    `.set()`/`.add()` build QuestionTag rows without calling `save()`, so
    this validation won't fire on that path. Treat it as a safety net for
    direct ORM/admin usage, not a guarantee.
    """

    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    tag = models.ForeignKey("tag.Tag", on_delete=models.CASCADE)

    class Meta:
        db_table = "forum_question_tags"
        constraints = [
            models.UniqueConstraint(
                fields=["question", "tag"], name="unique_question_tag"
            )
        ]

    def clean(self):
        from tag.models import Tag

        if self.tag_id and self.tag.level != Tag.Level.TAG:
            raise ValidationError(
                "Questions can only be tagged with leaf-level tags."
            )


class Answer(models.Model):
    """forum_answer — an answer submitted to a question."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    body = models.TextField()
    is_endorsed = models.BooleanField(default=False)
    is_accepted = models.BooleanField(default=False)
    upvote_count = models.IntegerField(default=0)
    downvote_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_answer"
        ordering = ["-is_accepted", "-is_endorsed", "-upvote_count", "created_at"]
        indexes = [
            models.Index(fields=["question", "-created_at"]),
            models.Index(fields=["author", "-created_at"]),
        ]

    def __str__(self):
        return f"Answer to {self.question_id} by {self.author_id}"

    @property
    def net_vote_count(self):
        """Upvotes minus downvotes. Used both for display and by the role
        engine (apps.users.services.evaluate_role_change) to judge whether
        an Expert Solver's recent answers are landing badly."""
        return self.upvote_count - self.downvote_count


class QuestionUpvote(models.Model):
    """Tracks which users have upvoted which questions (toggleable)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="upvotes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="question_upvotes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_question_upvote"
        constraints = [
            models.UniqueConstraint(
                fields=["question", "user"], name="unique_question_upvote"
            )
        ]


class AnswerUpvote(models.Model):
    """Tracks which users have upvoted which answers (toggleable).

    A user may hold at most one of AnswerUpvote / AnswerDownvote for a
    given answer at a time. That mutual exclusivity is enforced in the
    view layer (voting one direction clears the other), not via a DB
    constraint, since the two are separate tables.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, related_name="upvotes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="answer_upvotes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_answer_upvote"
        constraints = [
            models.UniqueConstraint(
                fields=["answer", "user"], name="unique_answer_upvote"
            )
        ]


class AnswerDownvote(models.Model):
    """Tracks which users have downvoted which answers (toggleable).

    Mirrors AnswerUpvote. Added so answer quality can go negative, which
    feeds the automatic Expert Solver -> Student demotion check in
    apps.users.services.evaluate_role_change.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, related_name="downvotes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="answer_downvotes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_answer_downvote"
        constraints = [
            models.UniqueConstraint(
                fields=["answer", "user"], name="unique_answer_downvote"
            )
        ]


class AnswerResource(models.Model):
    """forum_answer_resource — resources suggested alongside a specific
    answer, as a way to point the question's author (and future readers)
    toward further reading.

    This is a through-table rather than a FK on Resource itself: the
    Resource row lives in the shared apps.resources repository exactly
    like any resource submitted from that section of the site, and the
    same resource can legitimately be suggested under more than one
    answer/question. `resource` is nullable=False on purpose — a link
    with no resource shouldn't exist; if the resource is deleted from the
    repository, the suggestion under this answer should disappear too
    (hence CASCADE, not SET_NULL).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, related_name="suggested_resources"
    )
    # NOTE: adjust "resources.Resource" if the resources app's label
    # differs from "resources" in INSTALLED_APPS.
    resource = models.ForeignKey(
        "resources.Resource", on_delete=models.CASCADE, related_name="answer_links"
    )
    suggested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resource_suggestions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_answer_resource"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["answer", "resource"], name="unique_answer_resource"
            )
        ]

    def __str__(self):
        return f"Resource {self.resource_id} suggested on answer {self.answer_id}"