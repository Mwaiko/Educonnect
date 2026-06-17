from rest_framework import serializers
from .models import StudyGroup, Membership, MeetingLink


class MeetingLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingLink
        fields = ['id', 'provider', 'meeting_url', 'scheduled_at', 'created_at']
        read_only_fields = ['id', 'created_at']


class MembershipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Membership
        fields = ['id', 'user', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'username': obj.user.username if hasattr(obj.user, 'username') else obj.user.email,
            'email': obj.user.email,
        }


class StudyGroupSerializer(serializers.ModelSerializer):
    member_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    created_by = serializers.SerializerMethodField()
    meeting_links = MeetingLinkSerializer(many=True, read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'subject_tag', 'formation_type',
            'max_members', 'created_by', 'created_at',
            'member_count', 'is_full', 'meeting_links', 'members'
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'formation_type']

    def get_created_by(self, obj):
        if obj.created_by:
            return {
                'id': str(obj.created_by.id),
                'email': obj.created_by.email,
            }
        return None

    def get_members(self, obj):
        memberships = obj.memberships.select_related('user').all()
        return MembershipSerializer(memberships, many=True).data


class CreateStudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ['name', 'subject_tag', 'max_members']

    def validate_max_members(self, value):
        if value < 2:
            raise serializers.ValidationError('A group must have at least 2 members.')
        if value > 20:
            raise serializers.ValidationError('A group cannot have more than 20 members.')
        return value


class CreateMeetingLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingLink
        fields = ['provider', 'scheduled_at']