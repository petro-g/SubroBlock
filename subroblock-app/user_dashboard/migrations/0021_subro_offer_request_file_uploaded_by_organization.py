# Generated by Django 3.2.25 on 2024-05-29 13:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0020_alter_subro_org_wallet_transaction_origin_wallet'),
    ]

    operations = [
        migrations.AddField(
            model_name='subro_offer_request_file',
            name='uploaded_by_organization',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='user_dashboard.subro_organization'),
        ),
    ]
