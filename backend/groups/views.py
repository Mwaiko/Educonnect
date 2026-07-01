from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import StudyGroup, Membership, MeetingLink
from .serializers import (
    StudyGroupSerializer,
    CreateStudyGroupSerializer,
    CreateMeetingLinkSerializer,
)


class StudyGroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateStudyGroupSerializer
        return StudyGroupSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = StudyGroup.objects.filter(memberships__user=user).select_related('subject_tag')
        subject = self.request.query_params.get('subject_tag')
        if subject:
            # subject_tag is now a FK - keep the free-text search UX by
            # matching against the related Tag's name instead of the old
            # CharField itself.
            queryset = queryset.filter(subject_tag__name__icontains=subject)
        return queryset.distinct()

    def perform_create(self, serializer):
        group = serializer.save(
            created_by=self.request.user,
            formation_type='manual'
        )
        Membership.objects.create(group=group, user=self.request.user)
        return group

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = self.perform_create(serializer)
        output = StudyGroupSerializer(group, context={'request': request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class StudyGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudyGroupSerializer

    def get_queryset(self):
        return StudyGroup.objects.select_related('subject_tag')


class StudyGroupJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Study group not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        if group.is_full:
            return Response(
                {'error': {'code': 'group_full', 'message': 'This group is already at capacity.'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Membership.objects.filter(group=group, user=request.user).exists():
            return Response(
                {'error': {'code': 'already_member', 'message': 'You are already a member of this group.'}},
                status=status.HTTP_409_CONFLICT
            )

        Membership.objects.create(group=group, user=request.user)
        return Response(
            {'message': 'Successfully joined the group.', 'member_count': group.member_count},
            status=status.HTTP_200_OK
        )


class StudyGroupLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Study group not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        membership = Membership.objects.filter(group=group, user=request.user).first()
        if not membership:
            return Response(
                {'error': {'code': 'not_member', 'message': 'You are not a member of this group.'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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

        meeting_url = self._generate_meeting_url(provider, group)

        meeting = MeetingLink.objects.create(
            group=group,
            provider=provider,
            meeting_url=meeting_url,
            scheduled_at=scheduled_at
        )

        return Response({
            'id': str(meeting.id),
            'provider': meeting.provider,
            'meeting_url': meeting.meeting_url,
            'scheduled_at': meeting.scheduled_at,
        }, status=status.HTTP_201_CREATED)

    def _generate_meeting_url(self, provider, group):
        import uuid
        unique_code = str(uuid.uuid4())[:8]
        if provider == 'google_meet':
            return f"https://meet.google.com/{unique_code}"
        elif provider == 'zoom':
            return f"https://zoom.us/j/{unique_code}"
        return f"https://meet.example.com/{unique_code}"


class MeetingLinkDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, meeting_pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Study group not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        if not Membership.objects.filter(group=group, user=request.user).exists():
            return Response(
                {'error': {'code': 'not_member', 'message': 'You must be a member to manage meeting links.'}},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            meeting = MeetingLink.objects.get(pk=meeting_pk, group=group)
        except MeetingLink.DoesNotExist:
            return Response(
                {'error': {'code': 'not_found', 'message': 'Meeting link not found.'}},
                status=status.HTTP_404_NOT_FOUND
            )

        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudyGroupMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user
        # NOTE: this assumes `user.subjects` now yields leaf Tag ids (uuids)
        # rather than the old free-text subject strings, since subject_tag
        # is a FK. If `user.subjects` actually stores something else
        # (e.g. tag slugs), swap `subject_tag_id__in=user_subjects` below
        # for `subject_tag__slug__in=user_subjects`. Wasn't able to verify
        # against the User model, which wasn't provided.
        user_subjects = getattr(user, 'subjects', [])

        if not user_subjects:
            groups = StudyGroup.objects.exclude(
                memberships__user=user
            ).filter(
                memberships__isnull=False
            ).select_related('subject_tag').distinct()[:10]
        else:
            groups = StudyGroup.objects.exclude(
                memberships__user=user
            ).filter(
                subject_tag_id__in=user_subjects
            ).select_related('subject_tag').distinct()[:10]

        serializer = StudyGroupSerializer(groups, many=True, context={'request': request})
        return Response(serializer.data)