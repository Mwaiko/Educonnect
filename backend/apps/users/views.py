from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404

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
