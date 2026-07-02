from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


ROLE_CHOICES = [
    ("student", "Student"),
    ("expert_solver", "Expert Solver"),
]


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        # `subjects` is now a ManyToMany (see User.subjects below), which
        # can't be assigned via the model constructor — it needs a pk to
        # exist first. Pop it out and .set() it after save().
        subjects = extra_fields.pop("subjects", None)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        if subjects is not None:
            user.subjects.set(subjects)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "student")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    bio = models.TextField(blank=True, default="")
    # Subject choices now come from the shared taxonomy in the `tag` app
    # (see apps/tag/models.py) rather than a hardcoded list, so both apps
    # stay in sync automatically as the taxonomy grows. By convention
    # "subjects" means subcategory-level tags (e.g. "Algorithms",
    # "Databases") — enforcement of that restriction lives in the
    # serializers (RegisterSerializer / UpdateProfileSerializer use
    # Tag.objects.subcategories() as their queryset), not here: like
    # QuestionTag.clean() elsewhere in this codebase, M2M .set()/.add()
    # bypass model-level clean(), so the serializer queryset is the real
    # source of truth, not defense-in-depth on the model.
    subjects = models.ManyToManyField(
        "tag.Tag", blank=True, related_name="interested_users"
    )

    # Gamification fields (populated by gamification module)
    streak_count = models.PositiveIntegerField(default=0)
    points_total = models.PositiveIntegerField(default=0)
    rank_position = models.PositiveIntegerField(default=0)

    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        db_table = "users_user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.first_name} {self.last_name} <{self.email}>"

    @property
    def initials(self):
        return f"{self.first_name[0]}{self.last_name[0]}".upper()

    @property
    def joined_date(self):
        return self.date_joined.strftime("%B %Y")


class RoleChangeLog(models.Model):
    """Audit trail for Student <-> Expert Solver role changes.

    Written by apps.users.services.evaluate_role_change() whenever the
    automatic role engine promotes or demotes someone, and read by that
    same function to enforce a cooldown (see ROLE_ENGINE_COOLDOWN_DAYS)
    so a user's role can't flap back and forth from a short burst of
    votes. Also useful on its own as a "why did my role change" record
    for support/admin.
    """

    class Reason(models.TextChoices):
        AUTO_PROMOTED = "auto_promoted", "Automatically promoted (strong recent answers)"
        AUTO_DEMOTED = "auto_demoted", "Automatically demoted (poorly received answers)"
        MANUAL = "manual", "Changed manually by an admin"

    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="role_change_logs"
    )
    previous_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    new_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    reason = models.CharField(max_length=20, choices=Reason.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_role_change_log"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "-created_at"])]

    def __str__(self):
        return f"{self.user.email}: {self.previous_role} -> {self.new_role} ({self.reason})"


class GoogleOAuthToken(models.Model):
    user = models.OneToOneField(
        User,  # Points directly to the User model above
        on_delete=models.CASCADE,
        related_name='google_oauth_token'
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_google_oauth_token'
        verbose_name = 'Google OAuth Token'
        verbose_name_plural = 'Google OAuth Tokens'

    def __str__(self):
        return f"Google Token for {self.user.email}"