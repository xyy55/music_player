from django.db import models
import os
from uuid import uuid4


def rename_img(instance, filename):
    upload_to = 'music_player/img'
    ext = filename.split('.')[-1]
    filename = '{}.{}'.format(uuid4().hex, ext)
    # return the whole path to the file
    return os.path.join(upload_to, filename)
def rename_mp3(instance, filename):
    upload_to = 'music_player/mp3'
    ext = filename.split('.')[-1]
    filename = '{}.{}'.format(uuid4().hex, ext)
    # return the whole path to the file
    return os.path.join(upload_to, filename)
def rename_lrc(instance, filename):
    upload_to = 'music_player/lrc'
    ext = filename.split('.')[-1]
    filename = '{}.{}'.format(uuid4().hex, ext)
    # return the whole path to the file
    return os.path.join(upload_to, filename)


# Create your models here.


class user(models.Model):
    username = models.CharField(max_length=10,primary_key=True)  # 保存用户名
    password = models.CharField(max_length=255)  # 保存密码
    ticket = models.CharField(max_length=30)  # 保存cookie值

    class Meta:
        db_table = 'user'


class song(models.Model):
    s_uuid = models.UUIDField(primary_key=True,default=uuid4,editable=False)
    s_name = models.CharField(max_length=50)
    s_author = models.CharField(max_length=30)
    image = models.ImageField(upload_to=rename_img,null=True)
    mp3 = models.FileField(upload_to=rename_mp3)
    lrc = models.FileField(upload_to=rename_lrc,null=True)

    def __str__(self):
        return self.s_name

class user_song(models.Model):
    user_id = models.ForeignKey(user,on_delete=models.CASCADE)
    song_id = models.ForeignKey(song,on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id)

