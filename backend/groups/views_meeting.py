import logging

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudyGroup, Membership, MeetingLink
from .serializers import CreateMeetingLinkSerializer
from .base import MeetingProviderError
from .factory import get_meeting_service

logger = logging.getLogger(__name__)


class MeetingLinkCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Study group not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        if not Membership.objects.filter(group=group, user=request.user).exists():
            return Response(
                {'error': {'code': 'not_member', 'message': 'You must be a member to generate a meeting link.'}},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreateMeetingLinkSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': {'code': 'validation_error', 'message': 'Invalid data.', 'details': serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider = serializer.validated_data['provider']
        scheduled_at = serializer.validated_data.get('scheduled_at')

        try:
            service = get_meeting_service(provider)
            meeting_url = service.create_meeting(group, scheduled_at, request.user)
        except MeetingProviderError as e:
            return Response(
                {'error': {'code': 'provider_error', 'message': str(e)}},
                status=status.HTTP_502_BAD_GATEWAY
            )

        try:
            with transaction.atomic():
                meeting = MeetingLink.objects.create(
                    group=group,
                    provider=provider,
                    meeting_url=meeting_url,
                    scheduled_at=scheduled_at
                )
        except Exception:
            # The remote meeting was created but we failed to persist it.
            # Log loudly so it can be cleaned up / retried manually — full
            # automated delete-on-rollback per provider is a further step
            # (Zoom: DELETE /meetings/{id}, Google: events().delete(...)).
            logger.exception(
                "DB write failed after remote meeting was created "
                "(provider=%s, group_id=%s, url=%s)",
                provider, group.id, meeting_url,
            )
            return Response(
                {'error': {'code': 'persistence_error', 'message': 'Meeting created but failed to save. Contact support.'}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'id': str(meeting.id),
            'provider': meeting.provider,
            'meeting_url': meeting.meeting_url,
            'scheduled_at': meeting.scheduled_at,
        }, status=status.HTTP_201_CREATED)