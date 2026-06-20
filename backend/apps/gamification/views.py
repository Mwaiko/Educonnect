from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PointTransaction, StreakRecord
from .serializers import (
    LeaderboardEntrySerializer,
    PointTransactionSerializer,
    StreakRecordSerializer,
    UserGamificationSummarySerializer,
)
from .services import get_leaderboard, get_total_points


class GamificationSummaryView(APIView):
    """
    GET /api/gamification/me/
    Returns the authenticated user's points total, current streak,
    recent transactions, and last 30 days of streak history.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        recent_tx = PointTransaction.objects.filter(user=user)[:10]
        streak_history = StreakRecord.objects.filter(user=user)[:30]

        data = {
            "user_id": user.pk,
            "username": user.username,
            "total_points": get_total_points(user),
            "current_streak": getattr(user, "streak_count", 0),
            "recent_transactions": PointTransactionSerializer(recent_tx, many=True).data,
            "streak_history": StreakRecordSerializer(streak_history, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    """
    GET /api/gamification/leaderboard/?timeframe=weekly
    Returns the top-10 users by points.  timeframe: weekly | monthly | all
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        timeframe = request.query_params.get("timeframe", "all")
        if timeframe not in ("weekly", "monthly", "all"):
            return Response(
                {"detail": "timeframe must be 'weekly', 'monthly', or 'all'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        entries = get_leaderboard(timeframe=timeframe, limit=10)
        serialized = LeaderboardEntrySerializer(entries, many=True).data
        return Response({"timeframe": timeframe, "leaderboard": serialized})


class PointTransactionListView(APIView):
    """
    GET /api/gamification/transactions/
    Returns paginated point history for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = PointTransaction.objects.filter(user=request.user)
        serializer = PointTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class StreakHistoryView(APIView):
    """
    GET /api/gamification/streaks/
    Returns streak history for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = StreakRecord.objects.filter(user=request.user)[:60]
        serializer = StreakRecordSerializer(records, many=True)
        return Response(serializer.data)
