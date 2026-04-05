from rest_framework import serializers
from apps.tags.serializers import TagSerializer
from apps.tags.models import Tag
from .models import Entry, Attachment, EntryVersion


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id", "file", "original_filename", "file_size", "content_type", "created_at")
        read_only_fields = ("id", "original_filename", "file_size", "content_type", "created_at")


class AttachmentUploadSerializer(serializers.Serializer):
    file = serializers.ImageField()

    def validate_file(self, value):
        if value.size > Attachment.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File too large. Maximum size is {Attachment.MAX_FILE_SIZE // (1024 * 1024)} MB."
            )
        content_type = getattr(value, "content_type", "")
        if content_type not in Attachment.ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError(
                "Unsupported file type. Allowed types: JPEG, PNG, WebP, GIF."
            )
        return value


class EntryListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    body_preview = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body_preview", "mood", "is_favorite",
            "tags", "created_at", "updated_at",
        )

    def get_body_preview(self, obj: Entry) -> str:
        return obj.body[:200] if obj.body else ""


class EntryTrashSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    body_preview = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body_preview", "mood", "is_favorite",
            "tags", "created_at", "updated_at", "deleted_at",
        )

    def get_body_preview(self, obj: Entry) -> str:
        return obj.body[:200] if obj.body else ""


class EntryVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryVersion
        fields = ("id", "version_num", "title", "body", "mood", "edited_at")


class EntryDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body", "mood", "is_favorite",
            "tags", "stickers", "canvas_data", "attachments",
            "share_token", "created_at", "updated_at",
        )


class EntryWriteSerializer(serializers.ModelSerializer):
    tag_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        default=list,
    )
    tags = TagSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body", "mood", "is_favorite",
            "tag_ids", "tags", "stickers", "canvas_data", "attachments", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "tags", "attachments")

    def validate_tag_ids(self, value):
        if not value:
            return value
        user = self.context["request"].user
        owned_ids = set(
            Tag.objects.filter(owner=user, id__in=value).values_list("id", flat=True)
        )
        requested_ids = {str(v) for v in value}
        invalid = requested_ids - {str(i) for i in owned_ids}
        if invalid:
            raise serializers.ValidationError(
                f"Tags not found or not owned by you: {', '.join(invalid)}"
            )
        return value

    def _set_tags(self, entry, tag_ids):
        if tag_ids is not None:
            entry.tags.set(Tag.objects.filter(id__in=tag_ids))

    def create(self, validated_data):
        tag_ids = validated_data.pop("tag_ids", [])
        entry = Entry.objects.create(**validated_data)
        self._set_tags(entry, tag_ids)
        return entry

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop("tag_ids", None)

        # Snapshot content fields if any of them changed
        content_fields = {"title", "body", "mood"}
        changed = any(
            validated_data.get(f) != getattr(instance, f)
            for f in content_fields
            if f in validated_data
        )
        if changed:
            next_version = instance.versions.count() + 1
            EntryVersion.objects.create(
                entry=instance,
                version_num=next_version,
                title=instance.title,
                body=instance.body,
                mood=instance.mood,
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._set_tags(instance, tag_ids)
        return instance


class EntryShareSerializer(serializers.ModelSerializer):
    """Public-safe read-only serializer for shared entries (no author/attachment info)."""
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body", "mood",
            "tags", "stickers", "canvas_data",
            "created_at", "updated_at",
        )
