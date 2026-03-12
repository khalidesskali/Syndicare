from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0014_remove_subscription_plan_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='syndicprofile',
            name='address',
        ),
        migrations.RemoveField(
            model_name='syndicprofile',
            name='company_name',
        ),
        migrations.RemoveField(
            model_name='syndicprofile',
            name='license_number',
        ),
        migrations.RemoveField(
            model_name='user',
            name='phone',
        ),
    ]
