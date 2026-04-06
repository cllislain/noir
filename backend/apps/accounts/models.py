import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


def avatar_upload_path(instance: "User", filename: str) -> str:
    import os
    ext = os.path.splitext(filename)[1].lower()
    return f"avatars/{instance.id}/{uuid.uuid4().hex}{ext}"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True, default="")
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    google_id = models.CharField(max_length=128, blank=True, default="", db_index=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return self.email
