from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AnswerViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r"questions", QuestionViewSet, basename="question")

answer_viewset = AnswerViewSet.as_view({"patch": "partial_update"})
answer_endorse = AnswerViewSet.as_view({"post": "endorse"})
answer_accept = AnswerViewSet.as_view({"post": "accept"})
answer_upvote = AnswerViewSet.as_view({"post": "upvote"})
answer_downvote = AnswerViewSet.as_view({"post": "downvote"})
question_answers_create = AnswerViewSet.as_view({"post": "create_for_question"})

urlpatterns = [
    path(
        "questions/<uuid:question_id>/answers/",
        question_answers_create,
        name="question-answers-create",
    ),
    path("answers/<uuid:pk>/", answer_viewset, name="answer-detail"),
    path("answers/<uuid:pk>/endorse/", answer_endorse, name="answer-endorse"),
    path("answers/<uuid:pk>/accept/", answer_accept, name="answer-accept"),
    path("answers/<uuid:pk>/upvote/", answer_upvote, name="answer-upvote"),
    path("answers/<uuid:pk>/downvote/", answer_downvote, name="answer-downvote"),
]

urlpatterns += router.urls