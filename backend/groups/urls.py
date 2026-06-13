from django.urls import path
from .views import (
    StudyGroupListCreateView,
    StudyGroupDetailView,
    StudyGroupJoinView,
    StudyGroupLeaveView,
    MeetingLinkCreateView,
    StudyGroupMatchView,
)

urlpatterns = [
    path('', StudyGroupListCreateView.as_view(), name='group-list-create'),
    path('match/', StudyGroupMatchView.as_view(), name='group-match'),
    path('<uuid:pk>/', StudyGroupDetailView.as_view(), name='group-detail'),
    path('<uuid:pk>/join/', StudyGroupJoinView.as_view(), name='group-join'),
    path('<uuid:pk>/leave/', StudyGroupLeaveView.as_view(), name='group-leave'),
    path('<uuid:pk>/meetings/', MeetingLinkCreateView.as_view(), name='group-meetings'),
]