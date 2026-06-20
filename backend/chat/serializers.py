from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'group_id', 'sender', 'content', 'sent_at']
        read_only_fields = ['id', 'sender', 'sent_at']

    def get_sender(self, obj):
        return {
            'id': str(obj.sender.id),
            'username': obj.sender.username if hasattr(obj.sender, 'username') else obj.sender.email,
        }