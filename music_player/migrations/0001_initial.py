# Generated by Django 2.1.1 on 2018-09-03 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='user',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=10)),
                ('password', models.CharField(max_length=255)),
                ('ticket', models.CharField(max_length=30)),
            ],
            options={
                'db_table': 'user',
            },
        ),
    ]
