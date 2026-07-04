import os
import environ
from pathlib import Path
from datetime import timedelta
from celery.schedules import crontab
BASE_DIR = Path(__file__).resolve().parent.parent

# This goes one level higher up to find your top folder
TOP_FOLDER_DIR = BASE_DIR.parent 

# Tell environ to look in that top folder for the .env file
environ.Env.read_env(os.path.join(TOP_FOLDER_DIR, '.env'))

# ─────────────────────────────────────────
# Security & Core Django Settings
# ─────────────────────────────────────────
SECRET_KEY = os.environ.get('SECRET_KEY', os.environ.get("DJANGO_SECRET_KEY", "change-me-in-production"))
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ─────────────────────────────────────────
# Installed Apps
# ─────────────────────────────────────────
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
    # Local Apps
    'resources',
    'apps.users',
    'apps.forum',
    'apps.gamification',
    'groups',
    # 'apps.notification',
    'django_extensions',
    'chat',
    'notifications',
    'apps.tag'
]

# ─────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = "educonnectbackend.urls"
GOOGLE_MEET_CONFIG = {
    "web": {
        "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
        "project_id": "educonnect-meet-integration",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET'),
        "redirect_uris": ["http://localhost:8000/api/auth/google/callback"]
    }
}

# Map these explicitly for your services to fetch
GOOGLE_CLIENT_ID = GOOGLE_MEET_CONFIG["web"]["client_id"]
GOOGLE_CLIENT_SECRET = GOOGLE_MEET_CONFIG["web"]["client_secret"]

#ZOOM CREDENTIALS
ZOOM_ACCOUNT_ID = os.environ.get('ZOOM_ACCOUNT_ID', 'your-zoom-account-id')
ZOOM_CLIENT_ID = os.environ.get('ZOOM_CLIENT_ID', 'your-zoom-client-id')
ZOOM_CLIENT_SECRET = os.environ.get('ZOOM_CLIENT_SECRET', 'your-zoom-client-secret')
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = 'educonnectbackend.wsgi.application'

# ─────────────────────────────────────────
# Database Configuration
# ─────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'educonnect_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'fastapi_style': {
            # This makes the log format look clean, showing time, level, and message
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'fastapi_style',
        },
    },
    'loggers': {
        # This catches all incoming HTTP requests and server logs (the FastAPI effect)
        'django': {
            'handlers': ['console'],
            'level': 'INFO', # Change to 'DEBUG' if you want even MORE logs
            'propagate': False,
        },
        # OPTIONAL: Uncomment the lines below if you want to see every single SQL query 
        # 'django.db.backends': {
        #     'handlers': ['console'],
        #     'level': 'DEBUG',
        #     'propagate': False,
        # },
    },
}
# ─────────────────────────────────────────
# Custom User Model
# ─────────────────────────────────────────
AUTH_USER_MODEL = "users.User"

# ─────────────────────────────────────────
# Django REST Framework
# ─────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '100/minute',
    },
}

# ─────────────────────────────────────────
# Simple JWT Configuration
# ─────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─────────────────────────────────────────
# CORS Configuration
# ─────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_ORIGIN', 'http://localhost:3000'),
    "http://localhost:5173",   # Vite default
]

# ─────────────────────────────────────────
# Email Configuration
# ─────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "EduConnect <no-reply@educonnect.ac.ke>"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# ─────────────────────────────────────────
# Password Validation
# ─────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
CELERY_BEAT_SCHEDULE = {
        "finalize-streaks-midnight": {
            "task": "gamification.tasks.finalize_streaks",
            "schedule": crontab(hour=0, minute=0),
        },
    }
# ─────────────────────────────────────────
# Internationalisation & Static
# ─────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'

# ─────────────────────────────────────────
# Django Channels Configuration
# ─────────────────────────────────────────
ASGI_APPLICATION = 'educonnectbackend.routing.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'