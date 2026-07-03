from django.db import transaction
from rest_framework import serializers

from apps.tag.models import Tag
from apps.tag.serializers import TagSerializer

# NOTE: adjust this import if the resources app's python path/app label
# differs from apps.resources / "resources".
from resources.models import Resource
from resources.serializers import ResourceSerializer

from .models import Answer, AnswerResource, Question


class AuthorSerializer(serializers.Serializer):
    """Minimal nested author representation."""

    id = serializers.UUIDField()
    username = serializers.CharField()


class AnswerResourceSerializer(serializers.ModelSerializer):
    """Read-only representation of a resource suggested under an answer.

    Renders as a small card: the full nested resource (title, url, type,
    tag breadcrumb, net_votes, ...) plus who suggested it here and when.
    """

    resource = ResourceSerializer(read_only=True)
    suggested_by = serializers.SerializerMethodField()

    class Meta:
        model = AnswerResource
        fields = ["id", "resource", "suggested_by", "created_at"]

    def get_suggested_by(self, obj):
        return {"id": obj.suggested_by_id, "username": obj.suggested_by.first_name}


class AnswerResourceCreateSerializer(serializers.Serializer):
    """Attaches a resource to an answer.

    Accepts EITHER:
      - resource_id: link an existing resource from the repository, or
      - title + url (+ optional resource_type / tag_id): create a brand
        new Resource in the shared repository and link it in one step.

    Exactly one of these two paths should be used per call.
    """

    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source="resource", required=False
    )
    title = serializers.CharField(required=False, allow_blank=True, max_length=255)
    url = serializers.URLField(required=False, allow_blank=True)
    resource_type = serializers.ChoiceField(
        choices=Resource.RESOURCE_TYPES, required=False, allow_blank=True
    )
    tag_id = serializers.PrimaryKeyRelatedField(
        source="tag",
        queryset=Tag.objects.leaf_tags(),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        has_existing = bool(attrs.get("resource"))
        has_new = bool(attrs.get("title", "").strip()) and bool(attrs.get("url", "").strip())
        if has_existing and has_new:
            raise serializers.ValidationError(
                "Provide either resource_id OR title + url, not both."
            )
        if not has_existing and not has_new:
            raise serializers.ValidationError(
                "Provide either resource_id (an existing resource) or "
                "title + url (to add a new one)."
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        answer = self.context["answer"]
        user = self.context["request"].user

        resource = validated_data.get("resource")
        if resource is None:
            resource = Resource.objects.create(
                submitted_by=user,
                title=validated_data["title"].strip(),
                url=validated_data["url"].strip(),
                resource_type=validated_data.get("resource_type") or None,
                tag=validated_data.get("tag"),
            )

        link, _created = AnswerResource.objects.get_or_create(
            answer=answer, resource=resource, defaults={"suggested_by": user}
        )
        return link


class AnswerSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    user_has_upvoted = serializers.SerializerMethodField()
    user_has_downvoted = serializers.SerializerMethodField()
    net_vote_count = serializers.ReadOnlyField()
    suggested_resources = AnswerResourceSerializer(many=True, read_only=True)

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
            "suggested_resources",
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
            "suggested_resources",
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