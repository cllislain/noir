from rest_framework import serializers
from apps.accounts.models import User
from apps.entries.models import Entry
from apps.tags.models import Tag
from .models import SiteSettings


class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    staff_users = serializers.IntegerField()
    total_entries = serializers.IntegerField()
    active_entries = serializers.IntegerField()
    deleted_entries = serializers.IntegerField()
    total_tags = serializers.IntegerField()


# ── Read serializers ───────────────────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    entry_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id", "email", "username",
            "is_active", "is_staff", "is_superuser",
            "date_joined", "last_login", "entry_count",
        )
        read_only_fields = ("id", "email", "username", "date_joined", "last_login", "entry_count")


class AdminEntrySerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source="author.email", read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    tag_count = serializers.IntegerField(read_only=True)
    body_preview = serializers.SerializerMethodField()
    tags = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id", "title", "body", "body_preview", "mood",
            "is_favorite", "is_deleted", "deleted_at",
            "author_email", "author_username", "tag_count", "tags",
            "created_at", "updated_at",
        )
        read_only_fields = fields

    def get_body_preview(self, obj: Entry) -> str:
        return obj.body[:150] if obj.body else ""


class AdminTagSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    entry_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = (
            "id", "name", "color",
            "owner_email", "owner_username", "entry_count",
            "created_at",
        )
        read_only_fields = fields


# ── Write serializers ──────────────────────────────────────────────────────

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "username", "password", "is_active", "is_staff", "is_superuser")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "username", "is_active", "is_staff", "is_superuser")


class AdminSetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=8)


class AdminEntryWriteSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Entry
        fields = ("author", "title", "body", "mood", "is_favorite", "tags", "is_deleted")


class AdminTagWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("owner", "name", "color")


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ("default_inactivity_timeout",)


class SharedLinkSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    author_email = serializers.EmailField(source="author.email", read_only=True)

    class Meta:
        model = Entry
        fields = ("id", "title", "author_username", "author_email", "share_token", "created_at")

