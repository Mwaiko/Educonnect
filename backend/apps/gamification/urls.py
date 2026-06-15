from django.urls import path
from .views import (
    GamificationSummaryView,
    LeaderboardView,
    PointTransactionListView,
    StreakHistoryView,
)

urlpatterns = [
    path("me/", GamificationSummaryView.as_view(), name="gamification-summary"),
    path("leaderboard/", LeaderboardView.as_view(), name="gamification-leaderboard"),
    path("transactions/", PointTransactionListView.as_view(), name="gamification-transactions"),
    path("streaks/", StreakHistoryView.as_view(), name="gamification-streaks"),
]
