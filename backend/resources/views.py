from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, BasePermission, SAFE_METHODS
from django.db.models import Q
from .models import Resource, Vote
from .serializers import ResourceSerializer, VoteSerializer


class IsSubmitterOrReadOnly(BasePermission):
    """Anyone authenticated can read; only the original submitter can edit/delete."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.submitted_by_id == request.user.id


class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    # Browsing the list is public; creating a resource still requires login.
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'tag__name']
    ordering_fields = ['net_votes', 'created_at']
    ordering = ['-net_votes']

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        queryset = Resource.objects.select_related('tag', 'submitted_by')
        # `tag` is now the leaf Tag's id (uuid), not a free-text string -
        # the picker on the frontend sends whatever id it fetched from
        # /api/v1/tags/. Also accept `tag_slug` for anyone linking in by
        # slug (e.g. a bookmarked URL) instead of id.
        tag = self.request.query_params.get('tag')
        tag_slug = self.request.query_params.get('tag_slug')
        resource_type = self.request.query_params.get('resource_type')
        if tag:
            queryset = queryset.filter(tag_id=tag)
        elif tag_slug:
            queryset = queryset.filter(tag__slug=tag_slug)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        return queryset

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSubmitterOrReadOnly]
    queryset = Resource.objects.select_related('tag', 'submitted_by')
    lookup_field = 'pk'

    def get_serializer_context(self):
        return {'request': self.request}


class ResourceVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
        except Resource.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Resource not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = VoteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'validation_error', 'message': 'Invalid vote value.', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )

        value = serializer.validated_data['value']
        existing_vote = Vote.objects.filter(resource=resource, user=request.user).first()

        if existing_vote:
            if existing_vote.value == value:
                resource.net_votes -= value
                resource.save()
                existing_vote.delete()
                return Response({'net_votes': resource.net_votes, 'user_vote': None}, status=status.HTTP_200_OK)
            else:
                resource.net_votes -= existing_vote.value
                resource.net_votes += value
                resource.save()
                existing_vote.value = value
                existing_vote.save()
        else:
            Vote.objects.create(resource=resource, user=request.user, value=value)
            resource.net_votes += value
            resource.save()

        return Response({'net_votes': resource.net_votes, 'user_vote': value}, status=status.HTTP_200_OK)