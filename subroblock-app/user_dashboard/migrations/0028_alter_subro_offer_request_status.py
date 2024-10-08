# Generated by Django 3.2.25 on 2024-06-11 18:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0027_subro_offer_request_arbitratedamount'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subro_offer_request',
            name='status',
            field=models.CharField(choices=[('0/2 keys', 'Zero Two Keys'), ('1/2 keys', 'One Two Keys'), ('Signed', 'Signed'), ('Arbitration', 'Arbitration'), ('Arbitration CA', 'Arbitration Ca'), ('AI', 'Ai'), ('AP1', 'Ap1'), ('AP2', 'Ap2'), ('AP3', 'Ap3'), ('Cancelled', 'Cancelled')], default='0/2 keys', max_length=20),
        ),
    ]
