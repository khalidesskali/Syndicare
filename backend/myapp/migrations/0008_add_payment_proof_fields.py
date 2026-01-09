from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_add_rib_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='rib',
            field=models.CharField(blank=True, help_text='RIB for bank transfers', max_length=34, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='payment_proof',
            field=models.FileField(blank=True, help_text='Upload payment proof (receipt, screenshot, etc.)', null=True, upload_to='payment_proofs/'),
        ),
        migrations.AddField(
            model_name='residentpayment',
            name='rib',
            field=models.CharField(blank=True, help_text='RIB for bank transfers', max_length=34, null=True),
        ),
        migrations.AddField(
            model_name='residentpayment',
            name='payment_proof',
            field=models.FileField(blank=True, help_text='Upload payment proof (receipt, screenshot, etc.)', null=True, upload_to='resident_payment_proofs/'),
        ),
    ]
