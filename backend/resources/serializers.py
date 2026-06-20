from rest_framework import serializers
from .models import Resource, Vote


class ResourceSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'submitted_by', 'title', 'url',
            'resource_type', 'tag', 'net_votes',
            'created_at', 'user_vote'
        ]
        read_only_fields = ['id', 'net_votes', 'created_at', 'submitted_by', 'user_vote']

    def get_submitted_by(self, obj):
        if obj.submitted_by:
            return {
                'id': str(obj.submitted_by.id),
                'username': f"{obj.submitted_by.first_name} {obj.submitted_by.last_name}".strip(),
                'email': obj.submitted_by.email,
            }
        return None
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            return vote.value if vote else None
        return None


class VoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[1, -1])
