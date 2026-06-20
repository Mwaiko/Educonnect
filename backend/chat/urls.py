from django.urls import path
from .views import ChatMessageListView

urlpatterns = [
    path('<uuid:group_id>/messages/', ChatMessageListView.as_view(), name='chat-message-list'),
]