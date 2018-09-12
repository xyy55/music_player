# Generated by Django 2.1.1 on 2018-09-10 07:00

from django.db import migrations, models
import music_player.models


class Migration(migrations.Migration):

    dependencies = [
        ('music_player', '0004_auto_20180910_1445'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='lrc',
            field=models.FileField(null=True, upload_to=music_player.models.rename_lrc),
        ),
        migrations.AddField(
            model_name='song',
            name='mp3',
            field=models.FileField(null=True, upload_to=music_player.models.rename_mp3),
        ),
        migrations.AddField(
            model_name='song',
            name='s_author',
            field=models.CharField(max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='song',
            name='image',
            field=models.ImageField(null=True, upload_to=music_player.models.rename_img),
        ),
        migrations.AlterField(
            model_name='song',
            name='s_name',
            field=models.CharField(max_length=50, null=True),
        ),
    ]