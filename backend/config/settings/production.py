from .base import *  # noqa: F401, F403

import os
import dj_database_url
from decouple import config, Csv

DEBUG = False

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")
    if h.strip()
]
ALLOWED_HOSTS += [".onrender.com"]

# ── Database — Supabase PostgreSQL via DATABASE_URL ──────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True,
    )
}

# ── Security ──────────────────────────────────────────────────────────────────
# Render terminates SSL at the load balancer and passes this header
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)

# ── Static files — WhiteNoise ─────────────────────────────────────────────────
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
    # Media storage defined below — overridden to Supabase S3
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
}

# ── Supabase S3-compatible Storage ────────────────────────────────────────────
_SUPABASE_URL = config("SUPABASE_URL")          # e.g. https://xyz.supabase.co
_SUPABASE_BUCKET = config("SUPABASE_BUCKET")    # e.g. noir_journal

AWS_S3_ENDPOINT_URL = f"{_SUPABASE_URL}/storage/v1/s3"
AWS_ACCESS_KEY_ID = config("SUPABASE_S3_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("SUPABASE_S3_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = _SUPABASE_BUCKET
AWS_S3_REGION_NAME = config("SUPABASE_S3_REGION", default="ap-southeast-1")
AWS_S3_ADDRESSING_STYLE = "path"          # required by Supabase
AWS_S3_SIGNATURE_VERSION = "s3v4"
AWS_DEFAULT_ACL = "public-read"           # files are publicly accessible
AWS_QUERYSTRING_AUTH = False              # use direct public URLs, no signed queries
AWS_S3_FILE_OVERWRITE = False

# Public URL base: https://<project>.supabase.co/storage/v1/object/public/<bucket>
_supabase_host = _SUPABASE_URL.replace("https://", "")
AWS_S3_CUSTOM_DOMAIN = f"{_supabase_host}/storage/v1/object/public/{_SUPABASE_BUCKET}"

# MEDIA_URL is derived from the custom domain — Django will prepend this to file names
MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"
