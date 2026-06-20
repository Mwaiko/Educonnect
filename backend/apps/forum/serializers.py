from django.db import transaction
from rest_framework import serializers

from .models import Answer, Question, QuestionTag, Tag


class AuthorSerializer(serializers.Serializer):
    """Minimal nested author representation."""

    id = serializers.UUIDField()
    username = serializers.CharField()


class AnswerSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    user_has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = [
            "id",
            "question",
            "author",
            "body",
            "is_endorsed",
            "is_accepted",
            "upvote_count",
            "user_has_upvoted",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "question",
            "author",
            "is_endorsed",
            "is_accepted",
            "upvote_count",
            "created_at",
        ]

    def get_author(self, obj):
        return {"id": obj.author_id, "username": obj.author.username}

    def get_user_has_upvoted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.upvotes.filter(user=request.user).exists()


class AnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["body"]

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("Answer body cannot be empty.")
        return value


class QuestionListSerializer(serializers.ModelSerializer):
    """Serializer for the question feed (list view)."""

    author = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    answer_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "body",
            "author",
            "tags",
            "is_resolved",
            "upvote_count",
            "answer_count",
            "created_at",
        ]

    def get_author(self, obj):
        return {"id": obj.author_id, "username": obj.author.username}

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]


class QuestionDetailSerializer(QuestionListSerializer):
    """Serializer for a single question, including its answers."""

    answers = AnswerSerializer(many=True, read_only=True)
    user_has_upvoted = serializers.SerializerMethodField()

    class Meta(QuestionListSerializer.Meta):
        fields = QuestionListSerializer.Meta.fields + [
            "answers",
            "user_has_upvoted",
            "updated_at",
        ]

    def get_user_has_upvoted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.upvotes.filter(user=request.user).exists()


class QuestionCreateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        default=list,
    )

    class Meta:
        model = Question
        fields = ["title", "body", "tags"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("Body cannot be empty.")
        return value

    def validate_tags(self, value):
        cleaned = []
        for raw in value:
            name = raw.strip().lower()
            if name:
                cleaned.append(name)
        return cleaned

    @transaction.atomic
    def create(self, validated_data):
        tag_names = validated_data.pop("tags", [])
        question = Question.objects.create(
            author=self.context["request"].user, **validated_data
        )
        self._set_tags(question, tag_names)
        return question

    @transaction.atomic
    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tags", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            QuestionTag.objects.filter(question=instance).delete()
            self._set_tags(instance, tag_names)
        return instance

    @staticmethod
    def _set_tags(question, tag_names):
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            QuestionTag.objects.get_or_create(question=question, tag=tag)
