# Generated by Django 3.2.25 on 2024-06-11 17:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0026_auto_20240610_0629'),
    ]

    operations = [
        migrations.AddField(
            model_name='subro_offer_request',
            name='arbitratedAmount',
            field=models.DecimalField(decimal_places=2, default=None, max_digits=15, null=True),
        ),
    ]
