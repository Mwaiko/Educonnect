from django.urls import path
from .views import (
    StudyGroupListCreateView,
    StudyGroupDetailView,
    StudyGroupJoinView,
    StudyGroupLeaveView,
    MeetingLinkDeleteView,
    StudyGroupMatchView,
)
from .views_meeting import MeetingLinkCreateView
from .views_auth import GoogleLoginView, GoogleCallbackView
urlpatterns = [
    path('', StudyGroupListCreateView.as_view(), name='group-list-create'),
    path('match/', StudyGroupMatchView.as_view(), name='group-match'),
    path('<uuid:pk>/', StudyGroupDetailView.as_view(), name='group-detail'),
    path('<uuid:pk>/join/', StudyGroupJoinView.as_view(), name='group-join'),
    path('<uuid:pk>/leave/', StudyGroupLeaveView.as_view(), name='group-leave'),
    path('<uuid:pk>/meetings/', MeetingLinkCreateView.as_view(), name='group-meetings'),
    path('<uuid:pk>/meetings/<uuid:meeting_pk>/', MeetingLinkDeleteView.as_view(), name='group-meeting-delete'),
    path('auth/google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
]
