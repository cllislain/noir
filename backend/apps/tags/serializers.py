from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    entry_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Tag
        fields = ("id", "name", "color", "created_at", "entry_count")
        read_only_fields = ("id", "created_at", "entry_count")
