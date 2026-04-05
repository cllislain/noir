from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("entries", "0002_entry_soft_delete"),
    ]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="stickers",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="entry",
            name="canvas_data",
            field=models.TextField(blank=True, default=""),
        ),
    ]
