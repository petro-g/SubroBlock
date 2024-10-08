# Generated by Django 3.2.25 on 2024-05-05 18:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0013_auto_20240429_0912'),
    ]

    operations = [
        migrations.RenameField(
            model_name='subro_org_wallet_transaction',
            old_name='wallet_id',
            new_name='origin_wallet',
        ),
        migrations.AddField(
            model_name='subro_org_wallet',
            name='name',
            field=models.CharField(blank=True, default='', max_length=400),
        ),
        migrations.AlterField(
            model_name='subro_offer_request',
            name='status',
            field=models.CharField(choices=[('0/2 keys', '0/2 keys'), ('1/2 keys', '1/2 keys'), ('Signed', 'Signed'), ('Arbitration', 'Arbitration'), ('AI', 'AI'), ('AP1', 'AP1'), ('AP2', 'AP2'), ('AP3', 'AP3')], default='0/2 keys', max_length=20),
        ),
        migrations.AlterField(
            model_name='subro_organization_user',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subro_organization_user', to='user_dashboard.subrouser'),
        ),
    ]
