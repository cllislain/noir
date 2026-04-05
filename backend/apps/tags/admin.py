from django.contrib import admin
from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "color", "created_at")
    search_fields = ("name", "owner__email")
    ordering = ("name",)
    raw_id_fields = ("owner",)
