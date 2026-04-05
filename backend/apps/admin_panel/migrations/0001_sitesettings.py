from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "default_inactivity_timeout",
                    models.IntegerField(
                        default=15,
                        help_text="Default inactivity lock timeout in minutes. 0 = never.",
                    ),
                ),
            ],
            options={"db_table": "admin_site_settings"},
        ),
    ]
