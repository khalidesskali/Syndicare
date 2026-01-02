from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0004_update_residentpayment_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='residentpayment',
            name='notes',
            field=models.TextField(blank=True, default='', help_text='Additional notes about the payment'),
        ),
    ]