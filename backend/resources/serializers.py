from rest_framework import serializers
from .models import Resource, Vote

from apps.tag.models import Tag
from apps.tag.serializers import TagSerializer


class ResourceSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    # Read: full nested tag (id, name, slug, level, breadcrumb) so the
    # frontend can show "Mathematics > Calculus > Chain Rule" instead of a
    # bare string.
    tag = TagSerializer(read_only=True)

    # Write: client sends just the leaf tag's id. Kept as a separate field
    # (source="tag") rather than making `tag` writable directly, since a
    # nested serializer can't easily accept a raw id on write.
    tag_id = serializers.PrimaryKeyRelatedField(
        source='tag',
        queryset=Tag.objects.leaf_tags(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Resource
        fields = [
            'id', 'submitted_by', 'title', 'url',
            'resource_type', 'tag', 'tag_id', 'net_votes',
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