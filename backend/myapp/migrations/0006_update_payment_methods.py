from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_add_notes_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='payment_method',
            field=models.CharField(choices=[('CASH', 'Cash'), ('BANK_TRANSFER', 'Bank Transfer')], max_length=20),
        ),
        migrations.AlterField(
            model_name='residentpayment',
            name='payment_method',
            field=models.CharField(choices=[('CASH', 'Cash'), ('BANK_TRANSFER', 'Bank Transfer')], max_length=20),
        ),
    ]
