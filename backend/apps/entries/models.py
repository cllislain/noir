import os
import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


def attachment_upload_path(instance: "Attachment", filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    safe_name = f"{uuid.uuid4().hex}{ext}"
    return f"attachments/{instance.entry.author_id}/{instance.entry_id}/{safe_name}"


class Entry(models.Model):
    class Mood(models.TextChoices):
        HAPPY = "happy", "Happy"
        NEUTRAL = "neutral", "Neutral"
        SAD = "sad", "Sad"
        ANXIOUS = "anxious", "Anxious"
        GRATEFUL = "grateful", "Grateful"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    mood = models.CharField(
        max_length=20,
        choices=Mood.choices,
        blank=True,
        default="",
    )
    is_favorite = models.BooleanField(default=False)
    tags = models.ManyToManyField(
        "tags.Tag",
        blank=True,
        related_name="entries",
    )
    # Stickers — list of {id, emoji, x, y, size} objects
    stickers = models.JSONField(default=list, blank=True)
    # Handwriting canvas — SVG/base64 data URL
    canvas_data = models.TextField(blank=True, default="")

    # Sharing
    share_token = models.UUIDField(null=True, blank=True, unique=True, db_index=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "entries_entry"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.author})"

    def soft_delete(self) -> None:
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])

    def restore(self) -> None:
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=["is_deleted", "deleted_at"])


class EntryVersion(models.Model):
    """Snapshot of an entry's content fields saved before each edit."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entry = models.ForeignKey(
        Entry,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_num = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField()
    mood = models.CharField(max_length=20, blank=True, default="")
    edited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "entries_entryversion"
        ordering = ["-edited_at"]
        unique_together = [("entry", "version_num")]

    def __str__(self) -> str:
        return f"v{self.version_num} of {self.entry_id}"


class Attachment(models.Model):
    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entry = models.ForeignKey(
        Entry,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.ImageField(upload_to=attachment_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "entries_attachment"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.original_filename} → {self.entry_id}"
