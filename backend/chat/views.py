from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer


class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs.get('group_id')
        return ChatMessage.objects.filter(group_id=group_id).order_by('sent_at')