from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


SUBJECT_CHOICES = [
    ("Algorithms", "Algorithms"),
    ("Data Structures", "Data Structures"),
    ("Mathematics", "Mathematics"),
    ("Databases", "Databases"),
    ("Networks", "Networks"),
    ("Operating Systems", "Operating Systems"),
    ("Software Engineering", "Software Engineering"),
    ("Machine Learning", "Machine Learning"),
    ("Web Development", "Web Development"),
    ("Computer Architecture", "Computer Architecture"),
]

ROLE_CHOICES = [
    ("student", "Student"),
    ("expert_solver", "Expert Solver"),
]


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
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
    subjects = models.JSONField(default=list, blank=True)

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
