from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'group_id', 'content', 'sent_at']
    search_fields = ['content']
    list_filter = ['group_id']
    ordering = ['-sent_at']