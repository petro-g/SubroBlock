# Generated by Django 3.2.25 on 2024-06-03 14:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0022_rename_file_type_subro_offer_request_file_file_format'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubroOfferSignature',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('signed_at', models.DateTimeField(auto_now_add=True)),
                ('signed_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_dashboard.subro_organization_user')),
            ],
        ),
        migrations.AddField(
            model_name='subro_offer_request',
            name='signatures',
            field=models.ManyToManyField(blank=True, related_name='signatures', to='user_dashboard.SubroOfferSignature'),
        ),
    ]
