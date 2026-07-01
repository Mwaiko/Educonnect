from django.urls import path

from .views import TagDetailView, TagListCreateView

urlpatterns = [
    path("", TagListCreateView.as_view(), name="tag-list-create"),
    path("<uuid:pk>/", TagDetailView.as_view(), name="tag-detail"),
]