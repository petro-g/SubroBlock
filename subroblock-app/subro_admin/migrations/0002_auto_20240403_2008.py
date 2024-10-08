# Generated by Django 3.2.25 on 2024-04-03 20:08

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0008_auto_20240403_1943'),
        ('subro_admin', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubroCoins',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('origin', models.TextField(blank=True, default='')),
                ('destination', models.TextField(blank=True, default='')),
                ('amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_dashboard.subro_organization')),
            ],
            options={
                'verbose_name': 'Subro Coins',
                'verbose_name_plural': 'Subro Coins',
            },
        ),
        migrations.DeleteModel(
            name='SubroOrganization',
        ),
    ]
