from django.contrib import admin
from .models import Resource, Vote

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'resource_type', 'tag', 'net_votes', 'submitted_by', 'created_at']
    search_fields = ['title', 'tag']
    list_filter = ['resource_type', 'tag']
    ordering = ['-net_votes']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'value']
    list_filter = ['value']
