from django.db import transaction
from django.db.models import Case, F, IntegerField, Prefetch, Value, When
from django_filters import rest_framework as filters
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.tag.models import Tag

from .models import (
    Answer,
    AnswerDownvote,
    AnswerResource,
    AnswerUpvote,
    Question,
    QuestionUpvote,
)
from .permissions import (
    IsAuthorOrAdminOrReadOnly,
    IsExpertSolverOrAdmin,
    IsQuestionAuthor,
)
from .serializers import (
    AnswerCreateSerializer,
    AnswerResourceCreateSerializer,
    AnswerResourceSerializer,
    AnswerSerializer,
    QuestionCreateSerializer,
    QuestionDetailSerializer,
    QuestionListSerializer,
)

# These hooks integrate with other modules (Gamification, Notifications).
# They are implemented as no-op-safe imports so this module can run/tests
# in isolation before the other modules' branches are merged into develop.
try:
    from gamification.services import award_points
except ImportError:  # pragma: no cover - gamification module not yet merged
    def award_points(user, event_type):
        return None

try:
    from notifications.services import notify_new_answer, notify_answer_endorsed, notify_answer_accepted
except ImportError:  # pragma: no cover - notifications module not yet merged
    def notify_new_answer(question, answer):
        return None

    def notify_answer_endorsed(answer):
        return None

    def notify_answer_accepted(answer):
        return None

try:
    from apps.users.services import evaluate_role_change
except ImportError:  # pragma: no cover - users app not yet merged
    def evaluate_role_change(user):
        return None


# Resources suggested under an answer are shown newest-first, with the
# resource + tag breadcrumb + suggester select_related in so rendering an
# answer's resource cards doesn't fan out into N extra queries.
ANSWER_RESOURCES_QS = AnswerResource.objects.select_related(
    "resource__tag__parent__parent", "resource__submitted_by", "suggested_by"
)

# Answers from Expert Solvers are surfaced ahead of regular student answers
# (but still behind an accepted/endorsed answer, which are stronger signals
# than the author's role). This is expressed as a queryset annotation
# rather than Answer.Meta.ordering because the priority depends on a join
# to the author's role, not a plain field on Answer itself.
EXPERT_ANSWER_ORDERING_QS = (
    Answer.objects.select_related("author")
    .annotate(
        is_expert_answer=Case(
            When(author__role="expert_solver", then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        )
    )
    .prefetch_related(Prefetch("suggested_resources", queryset=ANSWER_RESOURCES_QS))
    .order_by("-is_accepted", "-is_endorsed", "-is_expert_answer", "-upvote_count", "created_at")
)


class QuestionFilter(filters.FilterSet):
    tag = filters.CharFilter(field_name="tags__slug", lookup_expr="iexact")
    is_resolved = filters.BooleanFilter(field_name="is_resolved")
    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Question
        fields = ["tag", "is_resolved", "search"]

    def filter_search(self, queryset, name, value):
        from django.db.models import Q

        return queryset.filter(Q(title__icontains=value) | Q(body__icontains=value))


class QuestionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/forum/questions/                -> list (feed)
    POST   /api/v1/forum/questions/                -> create
    GET    /api/v1/forum/questions/{id}/           -> retrieve (with answers)
    PATCH  /api/v1/forum/questions/{id}/           -> update (author/admin)
    DELETE /api/v1/forum/questions/{id}/           -> delete (author/admin)
    POST   /api/v1/forum/questions/{id}/upvote/    -> toggle upvote
    """

    queryset = (
        Question.objects.all()
        .select_related("author")
        .prefetch_related(
            # select_related on the tag's ancestor chain so
            # Tag.breadcrumb doesn't fire extra queries per tag per
            # question when serialized.
            Prefetch("tags", queryset=Tag.objects.select_related("parent__parent")),
            Prefetch("answers", queryset=EXPERT_ANSWER_ORDERING_QS),
        )
    )
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrAdminOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = QuestionFilter

    ORDERING_FIELDS = {
        "-created_at": "-created_at",
        "created_at": "created_at",
        "upvote_count": "upvote_count",
        "-upvote_count": "-upvote_count",
    }

    def get_serializer_class(self):
        if self.action == "list":
            return QuestionListSerializer
        if self.action == "retrieve":
            return QuestionDetailSerializer
        return QuestionCreateSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        ordering = self.request.query_params.get("ordering", "-created_at")
        qs = qs.order_by(self.ORDERING_FIELDS.get(ordering, "-created_at"))
        return qs

    def perform_create(self, serializer):
        serializer.save()
        award_points(self.request.user, "question_posted")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return the full detail representation so the frontend gets a
        # consistent shape (tags, author, etc.) right after creation.
        question = serializer.instance
        out = QuestionDetailSerializer(question, context=self.get_serializer_context())
        headers = self.get_success_headers(out.data)
        return Response(out.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def upvote(self, request, pk=None):
        question = self.get_object()
        existing = QuestionUpvote.objects.filter(question=question, user=request.user).first()

        if existing:
            existing.delete()
            Question.objects.filter(pk=question.pk).update(
                upvote_count=F("upvote_count") - 1
            )
            user_has_upvoted = False
        else:
            QuestionUpvote.objects.create(question=question, user=request.user)
            Question.objects.filter(pk=question.pk).update(
                upvote_count=F("upvote_count") + 1
            )
            user_has_upvoted = True

        question.refresh_from_db(fields=["upvote_count"])
        return Response(
            {"upvote_count": question.upvote_count, "user_has_upvoted": user_has_upvoted}
        )


class AnswerViewSet(viewsets.GenericViewSet):
    """
    POST   /api/v1/forum/questions/{question_id}/answers/         -> create answer
    PATCH  /api/v1/forum/answers/{answer_id}/                     -> edit answer
    POST   /api/v1/forum/answers/{answer_id}/endorse/              -> toggle endorsement
    POST   /api/v1/forum/answers/{answer_id}/accept/                -> accept answer
    POST   /api/v1/forum/answers/{answer_id}/upvote/                -> toggle upvote
    POST   /api/v1/forum/answers/{answer_id}/downvote/              -> toggle downvote
    POST   /api/v1/forum/answers/{answer_id}/resources/             -> suggest a resource
    DELETE /api/v1/forum/answers/{answer_id}/resources/{resource_id}/ -> remove a suggested resource

    Several of these actions (endorse, accept, upvote, downvote) end by
    calling evaluate_role_change() on the answer's author — that's the
    automatic Student <-> Expert Solver promotion/demotion engine. It's a
    cheap no-op unless the author has enough recent answers to judge and
    crosses a threshold, so it's safe to call on every one of these.
    """

    queryset = Answer.objects.all().select_related("author", "question").prefetch_related(
        Prefetch("suggested_resources", queryset=ANSWER_RESOURCES_QS)
    )
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create_for_question":
            return AnswerCreateSerializer
        if self.action == "suggest_resource":
            return AnswerResourceCreateSerializer
        return AnswerSerializer

    @transaction.atomic
    def create_for_question(self, request, question_id=None):
        question = generics.get_object_or_404(Question, pk=question_id)
        serializer = AnswerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answer = Answer.objects.create(
            question=question, author=request.user, **serializer.validated_data
        )

        award_points(request.user, "answer_submitted")
        notify_new_answer(question, answer)

        out = AnswerSerializer(answer, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        answer = self.get_object()
        if not (answer.author_id == request.user.id or request.user.role == "admin"):
            return Response(
                {"detail": "You do not have permission to edit this answer."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = AnswerSerializer(
            answer, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsExpertSolverOrAdmin])
    @transaction.atomic
    def endorse(self, request, pk=None):
        answer = self.get_object()
        answer.is_endorsed = not answer.is_endorsed
        answer.save(update_fields=["is_endorsed"])

        if answer.is_endorsed:
            award_points(answer.author, "answer_endorsed")
            notify_answer_endorsed(answer)

        evaluate_role_change(answer.author)
        return Response({"is_endorsed": answer.is_endorsed})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsQuestionAuthor])
    @transaction.atomic
    def accept(self, request, pk=None):
        answer = self.get_object()
        question = answer.question

        if question.author_id != request.user.id:
            return Response(
                {"detail": "Only the question author can accept an answer."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only one accepted answer per question.
        Answer.objects.filter(question=question, is_accepted=True).exclude(
            pk=answer.pk
        ).update(is_accepted=False)

        answer.is_accepted = True
        answer.save(update_fields=["is_accepted"])

        question.is_resolved = True
        question.save(update_fields=["is_resolved"])

        award_points(answer.author, "answer_accepted")
        notify_answer_accepted(answer)

        evaluate_role_change(answer.author)
        return Response({"is_accepted": True})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def upvote(self, request, pk=None):
        answer = self.get_object()
        existing_up = AnswerUpvote.objects.filter(answer=answer, user=request.user).first()

        if existing_up:
            existing_up.delete()
            Answer.objects.filter(pk=answer.pk).update(upvote_count=F("upvote_count") - 1)
            user_has_upvoted = False
        else:
            # Upvoting clears any existing downvote from this user first —
            # a user can only hold one direction of vote at a time.
            existing_down = AnswerDownvote.objects.filter(answer=answer, user=request.user).first()
            if existing_down:
                existing_down.delete()
                Answer.objects.filter(pk=answer.pk).update(downvote_count=F("downvote_count") - 1)
            AnswerUpvote.objects.create(answer=answer, user=request.user)
            Answer.objects.filter(pk=answer.pk).update(upvote_count=F("upvote_count") + 1)
            user_has_upvoted = True

        answer.refresh_from_db(fields=["upvote_count", "downvote_count"])
        evaluate_role_change(answer.author)
        return Response(
            {
                "upvote_count": answer.upvote_count,
                "downvote_count": answer.downvote_count,
                "user_has_upvoted": user_has_upvoted,
                "user_has_downvoted": False if user_has_upvoted else AnswerDownvote.objects.filter(
                    answer=answer, user=request.user
                ).exists(),
            }
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def downvote(self, request, pk=None):
        answer = self.get_object()
        existing_down = AnswerDownvote.objects.filter(answer=answer, user=request.user).first()

        if existing_down:
            existing_down.delete()
            Answer.objects.filter(pk=answer.pk).update(downvote_count=F("downvote_count") - 1)
            user_has_downvoted = False
        else:
            # Downvoting clears any existing upvote from this user first.
            existing_up = AnswerUpvote.objects.filter(answer=answer, user=request.user).first()
            if existing_up:
                existing_up.delete()
                Answer.objects.filter(pk=answer.pk).update(upvote_count=F("upvote_count") - 1)
            AnswerDownvote.objects.create(answer=answer, user=request.user)
            Answer.objects.filter(pk=answer.pk).update(downvote_count=F("downvote_count") + 1)
            user_has_downvoted = True

        answer.refresh_from_db(fields=["upvote_count", "downvote_count"])
        evaluate_role_change(answer.author)
        return Response(
            {
                "upvote_count": answer.upvote_count,
                "downvote_count": answer.downvote_count,
                "user_has_upvoted": False if user_has_downvoted else AnswerUpvote.objects.filter(
                    answer=answer, user=request.user
                ).exists(),
                "user_has_downvoted": user_has_downvoted,
            }
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def suggest_resource(self, request, pk=None):
        """Attach a resource to this answer — either an existing repository
        resource (`resource_id`) or a brand-new one (`title` + `url` [+
        `resource_type`, `tag_id`]), which is created in the shared
        Resource repository and linked in the same step. Only the answer's
        author (or an admin) can suggest resources for it, same as editing.
        """
        answer = self.get_object()
        if not (answer.author_id == request.user.id or request.user.role == "admin"):
            return Response(
                {"detail": "Only the answer's author can suggest resources for it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AnswerResourceCreateSerializer(
            data=request.data, context={"request": request, "answer": answer}
        )
        serializer.is_valid(raise_exception=True)
        link = serializer.save()

        out = AnswerResourceSerializer(link, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def remove_resource(self, request, pk=None, resource_id=None):
        answer = self.get_object()
        if not (answer.author_id == request.user.id or request.user.role == "admin"):
            return Response(
                {"detail": "Only the answer's author can remove suggested resources."},
                status=status.HTTP_403_FORBIDDEN,
            )

        deleted, _ = answer.suggested_resources.filter(resource_id=resource_id).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        from django.shortcuts import get_object_or_404

        obj = get_object_or_404(Answer, pk=self.kwargs.get("pk"))
        return obj