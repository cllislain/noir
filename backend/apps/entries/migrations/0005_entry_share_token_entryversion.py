import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("entries", "0004_attachment"),
    ]

    operations = [
        # Add share_token to Entry
        migrations.AddField(
            model_name="entry",
            name="share_token",
            field=models.UUIDField(blank=True, db_index=True, null=True, unique=True),
        ),
        # Create EntryVersion table
        migrations.CreateModel(
            name="EntryVersion",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("version_num", models.PositiveIntegerField()),
                ("title", models.CharField(max_length=255)),
                ("body", models.TextField()),
                ("mood", models.CharField(blank=True, default="", max_length=20)),
                ("edited_at", models.DateTimeField(auto_now_add=True)),
                (
                    "entry",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="versions",
                        to="entries.entry",
                    ),
                ),
            ],
            options={
                "db_table": "entries_entryversion",
                "ordering": ["-edited_at"],
                "unique_together": {("entry", "version_num")},
            },
        ),
    ]
