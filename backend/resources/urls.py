from django.urls import path
from .views import ResourceListCreateView, ResourceDetailView, ResourceVoteView

urlpatterns = [
    path('', ResourceListCreateView.as_view(), name='resource-list-create'),
    path('<uuid:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('<uuid:pk>/vote/', ResourceVoteView.as_view(), name='resource-vote'),
]