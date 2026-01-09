from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0006_update_payment_methods'),
    ]

    operations = [
        migrations.AddField(
            model_name='syndicprofile',
            name='rib',
            field=models.CharField(
                max_length=34,
                blank=True,
                null=True,
                help_text="RIB (Bank Identifier) for bank transfers"
            ),
        ),
    ]
