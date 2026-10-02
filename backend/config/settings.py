import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


def get_env_bool(name, default=False):
    value = os.getenv(
        name,
        str(default),
    )

    return value.lower() in (
        "1",
        "true",
        "yes",
        "on",
    )


def get_env_list(name, default=""):
    value = os.getenv(name, default)

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-local-development-only",
)

DEBUG = get_env_bool(
    "DEBUG",
    default=True,
)

ALLOWED_HOSTS = get_env_list(
    "ALLOWED_HOSTS",
    default=(
        "localhost,"
        "127.0.0.1,"
        "0.0.0.0"
    ),
)


INSTALLED_APPS = [
    "jazzmin",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "storages",

    "accounts",
    "categories",
    "videos",
    "notifications",
    "comments",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django."
            "DjangoTemplates"
        ),
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                (
                    "django.template.context_processors."
                    "request"
                ),
                (
                    "django.contrib.auth.context_processors."
                    "auth"
                ),
                (
                    "django.contrib.messages.context_processors."
                    "messages"
                ),
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        ),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": (
                "django.db.backends.sqlite3"
            ),
            "NAME": BASE_DIR / "db.sqlite3",
        },
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "Asia/Tashkent"

USE_I18N = True

USE_TZ = True


STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

WHITENOISE_MANIFEST_STRICT = False

STORAGES = {
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
    "default": {
        "BACKEND": (
            "django.core.files.storage."
            "FileSystemStorage"
        ),
    },
}


MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


SUPABASE_STORAGE_ENDPOINT = os.getenv(
    "SUPABASE_STORAGE_ENDPOINT",
)

SUPABASE_STORAGE_ACCESS_KEY = os.getenv(
    "SUPABASE_STORAGE_ACCESS_KEY",
)

SUPABASE_STORAGE_SECRET_KEY = os.getenv(
    "SUPABASE_STORAGE_SECRET_KEY",
)

SUPABASE_STORAGE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "video-platform-media",
)

SUPABASE_STORAGE_REGION = os.getenv(
    "SUPABASE_STORAGE_REGION",
    "us-east-1",
)


if (
    SUPABASE_STORAGE_ENDPOINT
    and SUPABASE_STORAGE_ACCESS_KEY
    and SUPABASE_STORAGE_SECRET_KEY
):
    STORAGES["default"] = {
        "BACKEND": (
            "storages.backends.s3.S3Storage"
        ),
        "OPTIONS": {
            "access_key": (
                SUPABASE_STORAGE_ACCESS_KEY
            ),
            "secret_key": (
                SUPABASE_STORAGE_SECRET_KEY
            ),
            "bucket_name": (
                SUPABASE_STORAGE_BUCKET
            ),
            "region_name": (
                SUPABASE_STORAGE_REGION
            ),
            "endpoint_url": (
                SUPABASE_STORAGE_ENDPOINT
            ),
            "addressing_style": "path",
            "signature_version": "s3v4",
            "default_acl": None,
            "querystring_auth": True,
            "file_overwrite": False,
        },
    }


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication."
        "JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework."
        "DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=30,
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=7,
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_TOKEN_CLASSES": (
        "rest_framework_simplejwt.tokens."
        "AccessToken",
    ),
    "TOKEN_TYPE_CLAIM": "token_type",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}


AUTH_USER_MODEL = "accounts.User"


CORS_ALLOWED_ORIGINS = get_env_list(
    "CORS_ALLOWED_ORIGINS",
    default=(
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    ),
)

CSRF_TRUSTED_ORIGINS = get_env_list(
    "CSRF_TRUSTED_ORIGINS",
    default=(
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    ),
)


SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

SECURE_SSL_REDIRECT = (
    not DEBUG
)

SESSION_COOKIE_SECURE = (
    not DEBUG
)

CSRF_COOKIE_SECURE = (
    not DEBUG
)

SECURE_HSTS_SECONDS = (
    31536000
    if not DEBUG
    else 0
)

SECURE_HSTS_INCLUDE_SUBDOMAINS = (
    not DEBUG
)

SECURE_HSTS_PRELOAD = False

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_REFERRER_POLICY = (
    "same-origin"
)


JAZZMIN_SETTINGS = {
    "site_title": "Video Platform Admin",
    "site_header": "Video Platform",
    "site_brand": "Video Platform",
    "welcome_sign": (
        "Панель управления "
        "видеоплатформой"
    ),
    "show_sidebar": True,
    "navigation_expanded": True,
    "icons": {
        "videos.Video": "fas fa-video",
        "categories.Category": "fas fa-folder",
        "notifications.Notification": "fas fa-bell",
        "auth.User": "fas fa-users",
    },
}


DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
        "django.server": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
