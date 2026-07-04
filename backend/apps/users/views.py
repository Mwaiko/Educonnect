from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.humanize.templatetags.humanize import naturaltime

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .tokens import PasswordResetToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserProfileSerializer,
    PublicUserProfileSerializer,
    UpdateProfileSerializer,
)

# NOTE: adjust these import paths to match your actual app labels if they
# differ (e.g. "qa" instead of "forum", "study_groups" instead of "groups").
from apps.forum.models import Question, Answer, QuestionUpvote, AnswerUpvote
from resources.models import Resource, Vote
from groups.models import Membership
from apps.gamification.models import PointTransaction


# ─────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────

def _jwt_for_user(user):
    """Return access + refresh JWT tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# ─────────────────────────────────────────────────────────────
# Registration  POST /api/v1/auth/register/
# ─────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response(
            {"detail": "Registration successful.", **_jwt_for_user(user)},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────
# Login  POST /api/v1/auth/login/
# ─────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            # Flatten nested detail if present
            errors = serializer.errors
            detail = errors.get("non_field_errors") or errors.get("detail")
            if isinstance(detail, list):
                detail = detail[0]
            return Response(
                {"detail": detail or "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.validated_data["user"]
        return Response(_jwt_for_user(user), status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Password Change  POST /api/v1/auth/password-change/
# ─────────────────────────────────────────────────────────────

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Password Reset Request  POST /api/v1/auth/password-reset/
# ─────────────────────────────────────────────────────────────

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        # Always return 200 to avoid leaking account existence
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "If that email exists, a reset link has been sent."},
                status=status.HTTP_200_OK,
            )

        reset_token = PasswordResetToken.create_for_user(user)

        # Build reset link (configure FRONTEND_URL in settings)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"

        send_mail(
            subject="EduConnect – Password Reset",
            message=(
                f"Hi {user.first_name},\n\n"
                f"Click the link below to reset your password (expires in 1 hour):\n\n"
                f"{reset_link}\n\n"
                "If you didn't request this, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )

        return Response(
            {"detail": "If that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────
# Password Reset Confirm  POST /api/v1/auth/password-reset/confirm/
# ─────────────────────────────────────────────────────────────

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token_str = serializer.validated_data["token"]
        new_password = serializer.validated_data["password"]

        try:
            reset_token = PasswordResetToken.objects.select_related("user").get(
                token=token_str
            )
        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.used = True
        reset_token.save()

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Own Profile  GET + PATCH /api/v1/users/profile/
# ─────────────────────────────────────────────────────────────

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        # Return the full updated profile
        return Response(UserProfileSerializer(request.user).data)


# ─────────────────────────────────────────────────────────────
# Public Profile  GET /api/v1/users/<id>/
# ─────────────────────────────────────────────────────────────

class PublicUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk, is_active=True)
        serializer = PublicUserProfileSerializer(user)
        return Response(serializer.data)
class AuthMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Interactions: every contribution the user has made across the platform.
        questions_asked = Question.objects.filter(author=user).count()
        answers_given = Answer.objects.filter(author=user).count()
        resources_submitted = Resource.objects.filter(submitted_by=user).count()
        votes_cast = (
            QuestionUpvote.objects.filter(user=user).count()
            + AnswerUpvote.objects.filter(user=user).count()
            + Vote.objects.filter(user=user).count()
        )
        total_interactions = (
            questions_asked + answers_given + resources_submitted + votes_cast
        )

        # Completed tasks: answers that earned recognition, plus questions the
        # user asked that ended up resolved.
        accepted_answers = Answer.objects.filter(author=user, is_accepted=True).count()
        endorsed_only_answers = (
            Answer.objects.filter(author=user, is_endorsed=True)
            .exclude(is_accepted=True)
            .count()
        )
        resolved_questions = Question.objects.filter(
            author=user, is_resolved=True
        ).count()
        completed_tasks = accepted_answers + endorsed_only_answers + resolved_questions

        # Hours spent: there is no duration field tracked anywhere yet (sessions,
        # logins, etc. don't record elapsed time). As a stand-in, this estimates
        # 1 hour per attended study-group session logged in PointTransaction.
        # Replace with real session-duration tracking once it exists.
        sessions_attended = PointTransaction.objects.filter(
            user=user, event_type=PointTransaction.EventType.ATTEND_SESSION
        ).count()
        hours_spent = sessions_attended

        # `cards` powers the top stats-grid (StatCard expects
        # {icon, label, value, delta, color}). The profile-strip used to
        # pull its questions/answers/resources breakdown from here too,
        # but those aren't users-app data — they live in forum/resources.
        # Per request, the profile strip now only shows fields that
        # actually exist on the User model itself (via /auth/me/), so
        # this endpoint stays scoped to the stat cards.
        stats_data = {
            "cards": [
                {"icon": "⚡", "label": "Total Interactions", "value": total_interactions, "delta": "", "color": "primary"},
                {"icon": "⏱️", "label": "Hours Spent", "value": hours_spent, "delta": "", "color": "accent"},
                {"icon": "✅", "label": "Completed Tasks", "value": completed_tasks, "delta": "", "color": "success"},
                {"icon": "🏅", "label": "Global Rank", "value": user.rank_position, "delta": "", "color": "warning"},
            ],
        }

        return Response(stats_data, status=status.HTTP_200_OK)


class DashboardActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        per_source_limit = 5
        result_limit = 5

        events = []

        for q in Question.objects.filter(author=user).order_by("-created_at")[:per_source_limit]:
            events.append({
                "id": f"question-{q.id}",
                "action": f'Posted a question: "{q.title}"',
                "created_at": q.created_at,
            })

        for a in (
            Answer.objects.filter(author=user)
            .select_related("question")
            .order_by("-created_at")[:per_source_limit]
        ):
            events.append({
                "id": f"answer-{a.id}",
                "action": f'Answered: "{a.question.title}"',
                "created_at": a.created_at,
            })

        for r in Resource.objects.filter(submitted_by=user).order_by("-created_at")[:per_source_limit]:
            events.append({
                "id": f"resource-{r.id}",
                "action": f'Submitted a resource: "{r.title}"',
                "created_at": r.created_at,
            })

        for m in (
            Membership.objects.filter(user=user)
            .select_related("group")
            .order_by("-joined_at")[:per_source_limit]
        ):
            events.append({
                "id": f"membership-{m.id}",
                "action": f'Joined study group: "{m.group.name}"',
                "created_at": m.joined_at,
            })

        for pt in PointTransaction.objects.filter(user=user).order_by("-created_at")[:per_source_limit]:
            events.append({
                "id": f"points-{pt.id}",
                "action": pt.description or pt.get_event_type_display(),
                "created_at": pt.created_at,
            })

        events.sort(key=lambda e: e["created_at"], reverse=True)
        top_events = events[:result_limit]

        activity_data = [
            {
                "id": e["id"],
                "action": e["action"],
                "timestamp": naturaltime(e["created_at"]),
            }
            for e in top_events
        ]

        return Response(activity_data, status=status.HTTP_200_OK)