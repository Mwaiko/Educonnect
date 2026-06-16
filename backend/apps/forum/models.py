import uuid

from django.conf import settings
from django.db import models


class Tag(models.Model):
    """forum_tag — subject/topic tags applied to questions and resources."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        db_table = "forum_tag"
        ordering = ["name"]

    def __str__(self):
        return self.name


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
        Tag, through="QuestionTag", related_name="questions", blank=True
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
    """forum_question_tags — junction table between questions and tags."""

    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        db_table = "forum_question_tags"
        constraints = [
            models.UniqueConstraint(
                fields=["question", "tag"], name="unique_question_tag"
            )
        ]


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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "forum_answer"
        ordering = ["-is_accepted", "-is_endorsed", "-upvote_count", "created_at"]
        indexes = [
            models.Index(fields=["question", "-created_at"]),
        ]

    def __str__(self):
        return f"Answer to {self.question_id} by {self.author_id}"


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
    """Tracks which users have upvoted which answers (toggleable)."""

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
