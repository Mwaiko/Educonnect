from django.contrib import admin

from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "parent", "slug")
    list_filter = ("level",)
    search_fields = ("name", "slug")
    autocomplete_fields = ("parent",)