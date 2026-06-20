from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    PasswordChangeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserProfileView,
    AuthMeView,
    PublicUserProfileView,
    DashboardStatsView,   # <-- Add this
    DashboardActivityView, #
)

# Auth routes  →  /api/v1/auth/...
auth_urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", AuthMeView.as_view(), name="auth-me"),  # <-- Add this route
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("password-change/", PasswordChangeView.as_view(), name="password-change"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
# User routes  →  /api/v1/users/...
user_urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("<int:pk>/", PublicUserProfileView.as_view(), name="public-user-profile"),
]
dashboard_urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("activity/", DashboardActivityView.as_view(), name="dashboard-activity"),
]
