from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("entries", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="is_deleted",
            field=models.BooleanField(default=False, db_index=True),
        ),
        migrations.AddField(
            model_name="entry",
            name="deleted_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
