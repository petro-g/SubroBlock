# Generated by Django 3.2.25 on 2024-06-04 13:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0024_auto_20240604_1112'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subro_offer_request',
            name='signatures',
        ),
        migrations.RemoveField(
            model_name='subro_offer_responder',
            name='signatures',
        ),
        migrations.AddField(
            model_name='subrooffersignature',
            name='offer_request',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='user_dashboard.subro_offer_request'),
        ),
        migrations.AddField(
            model_name='subrorespondersignature',
            name='offer_responder',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='user_dashboard.subro_offer_responder'),
        ),
    ]
