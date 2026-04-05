from django.db import models


class SiteSettings(models.Model):
    """Singleton model — always pk=1. Stores site-wide configuration."""

    default_inactivity_timeout = models.IntegerField(
        default=15,
        help_text="Default inactivity lock timeout in minutes. 0 = never.",
    )

    class Meta:
        db_table = "admin_site_settings"

    @classmethod
    def get(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
