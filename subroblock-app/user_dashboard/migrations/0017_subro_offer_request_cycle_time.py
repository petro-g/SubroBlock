# Generated by Django 3.2.25 on 2024-05-08 12:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0016_alter_subro_offer_request_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='subro_offer_request',
            name='cycle_time',
            field=models.DurationField(blank=True, null=True),
        ),
    ]
