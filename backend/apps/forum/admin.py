from django.contrib import admin

from .models import Answer, Question
from apps.tag.models import Tag



class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "is_resolved", "upvote_count", "created_at"]
    list_filter = ["is_resolved"]
    search_fields = ["title", "body"]
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ["question", "author", "is_endorsed", "is_accepted", "upvote_count", "created_at"]
    list_filter = ["is_endorsed", "is_accepted"]
