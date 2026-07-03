from rest_framework import serializers
from .models import PointTransaction, StreakRecord


class PointTransactionSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(
        source="get_event_type_display", read_only=True
    )

    class Meta:
        model = PointTransaction
        fields = [
            "id",
            "event_type",
            "event_type_display",
            "points_awarded",
            "description",
            "created_at",
        ]
        read_only_fields = fields


class StreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StreakRecord
        fields = ["id", "date", "events_count", "streak_count"]
        read_only_fields = fields


class LeaderboardEntrySerializer(serializers.Serializer):
    """
    Expects dicts shaped like the output of services.get_leaderboard():
    {"user__id", "user__email", "user__first_name", "user__last_name", "total_points"}
    """

    def to_representation(self, instance):
        full_name = f"{instance['user__first_name']} {instance['user__last_name']}".strip()
        return {
            "user_id": instance["user__id"],
            "username": full_name or instance["user__email"],
            "full_name": full_name,
            "total_points": instance["total_points"],
        }


class UserGamificationSummarySerializer(serializers.Serializer):
    """Returned by /gamification/me/ — a snapshot of the authenticated user."""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    total_points = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    recent_transactions = PointTransactionSerializer(many=True)
    streak_history = StreakRecordSerializer(many=True)