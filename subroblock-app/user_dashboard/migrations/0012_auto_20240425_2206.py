# Generated by Django 3.2.25 on 2024-04-25 22:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0011_auto_20240425_1356'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE user_dashboard_subro_offer_request DROP COLUMN IF EXISTS offer_name"
        )
    ]
