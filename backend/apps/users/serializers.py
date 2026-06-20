from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, SUBJECT_CHOICES, ROLE_CHOICES


VALID_SUBJECTS = [s[0] for s in SUBJECT_CHOICES]
VALID_ROLES = [r[0] for r in ROLE_CHOICES]


# ─────────────────────────────────────────
# Auth Serializers
# ─────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    subjects = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_SUBJECTS),
        required=False,
        default=list,
    )
    role = serializers.ChoiceField(choices=VALID_ROLES, default="student")

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password", "role", "subjects"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This field must be unique.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError({"detail": "Invalid email or password."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account has been disabled."})
        data["user"] = user
        return data


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])


# ─────────────────────────────────────────
# User Profile Serializers
# ─────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    initials = serializers.ReadOnlyField()
    joined_date = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "bio",
            "subjects",
            "streak_count",
            "points_total",
            "rank_position",
            "joined_date",
            "initials",
        ]
        read_only_fields = ["id", "email", "streak_count", "points_total", "rank_position"]


class PublicUserProfileSerializer(serializers.ModelSerializer):
    """Reduced profile for public /users/:id/ endpoint — hides email."""
    initials = serializers.ReadOnlyField()
    joined_date = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "role",
            "bio",
            "subjects",
            "streak_count",
            "points_total",
            "rank_position",
            "joined_date",
            "initials",
        ]


class UpdateProfileSerializer(serializers.ModelSerializer):
    subjects = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_SUBJECTS),
        required=False,
    )

    class Meta:
        model = User
        fields = ["first_name", "last_name", "bio", "subjects"]
