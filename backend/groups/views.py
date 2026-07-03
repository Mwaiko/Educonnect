from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, F
from .models import StudyGroup, Membership, MeetingLink
from .serializers import (
    StudyGroupSerializer,
    CreateStudyGroupSerializer,
)
from apps.tag.models import Tag

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
        user_subjects = user.subjects.all()  # category-level tags

        groups = StudyGroup.objects.exclude(
            memberships__user=user
        ).select_related('subject_tag').annotate(
            _member_count=Count('memberships', distinct=True)
        ).filter(_member_count__lt=F('max_members'))

        if user_subjects.exists():
            # leaf tags whose subcategory's parent category is one the user follows
            leaf_tags = Tag.objects.leaf_tags().filter(parent__parent__in=user_subjects)
            groups = groups.filter(subject_tag__in=leaf_tags)
        else:
            groups = groups.filter(_member_count__gte=1)

        groups = groups.distinct()[:10]

        serializer = StudyGroupSerializer(groups, many=True, context={'request': request})
        return Response(serializer.data)