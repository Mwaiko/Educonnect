from django.db import transaction
from rest_framework import serializers

from apps.tag.models import Tag
from apps.tag.serializers import TagSerializer

from .models import Answer, Question


class AuthorSerializer(serializers.Serializer):
    """Minimal nested author representation."""

    id = serializers.UUIDField()
    username = serializers.CharField()


class AnswerSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    user_has_upvoted = serializers.SerializerMethodField()
    user_has_downvoted = serializers.SerializerMethodField()
    net_vote_count = serializers.ReadOnlyField()

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
            "downvote_count",
            "net_vote_count",
            "user_has_upvoted",
            "user_has_downvoted",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "question",
            "author",
            "is_endorsed",
            "is_accepted",
            "upvote_count",
            "downvote_count",
            "created_at",
        ]

    def get_author(self, obj):
        # `role` is included so the frontend can badge/sort Expert Solver
        # answers without a second lookup — mirrors the priority already
        # applied server-side in QuestionViewSet's answers queryset.
        return {
            "id": obj.author_id,
            "username": obj.author.first_name,
            "role": obj.author.role,
        }

    def get_user_has_upvoted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.upvotes.filter(user=request.user).exists()

    def get_user_has_downvoted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.downvotes.filter(user=request.user).exists()


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
        return {"id": obj.author_id, "username": obj.author.first_name}

    def get_tags(self, obj):
        # Relies on the view prefetching `tags` with `select_related(
        # "parent__parent")` so `.breadcrumb` doesn't trigger extra queries
        # per tag, per question.
        return TagSerializer(obj.tags.all(), many=True).data


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
    # Tags are now selected from the existing curated taxonomy, not typed
    # freely — a question can only be tagged with leaf-level (level=TAG)
    # Tag rows. Frontend should drive this off GET /forum/tags/ (cascading
    # category -> subcategory -> tag picker), not a free-text field.
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.leaf_tags(),
        many=True,
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

    @transaction.atomic
    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        question = Question.objects.create(
            author=self.context["request"].user, **validated_data
        )
        # QuestionTag has no fields beyond the two FKs, so .set() is safe
        # here (Django allows add()/set() on M2M-through as long as no
        # extra required fields exist on the through model).
        question.tags.set(tags)
        return question

    @transaction.atomic
    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance