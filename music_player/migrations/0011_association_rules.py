# Generated by Django 2.1.1 on 2018-09-17 02:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music_player', '0010_user_song'),
    ]

    operations = [
        migrations.CreateModel(
            name='association_rules',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('antecedent', models.CharField(max_length=255)),
                ('consequent', models.CharField(max_length=255)),
            ],
        ),
    ]