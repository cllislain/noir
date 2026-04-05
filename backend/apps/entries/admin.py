from django.contrib import admin
from .models import Entry


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "mood", "is_favorite", "is_deleted", "created_at")
    list_filter = ("mood", "is_favorite", "is_deleted")
    search_fields = ("title", "body", "author__email")
    ordering = ("-created_at",)
    raw_id_fields = ("author",)
    filter_horizontal = ("tags",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at")
