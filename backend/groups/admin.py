from django.contrib import admin
from .models import StudyGroup, Membership, MeetingLink


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject_tag', 'formation_type', 'max_members', 'member_count', 'created_by', 'created_at']
    search_fields = ['name', 'subject_tag']
    list_filter = ['formation_type', 'subject_tag']
    ordering = ['-created_at']


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'group', 'joined_at']
    list_filter = ['group']


@admin.register(MeetingLink)
class MeetingLinkAdmin(admin.ModelAdmin):
    list_display = ['group', 'provider', 'meeting_url', 'scheduled_at', 'created_at']
    list_filter = ['provider']