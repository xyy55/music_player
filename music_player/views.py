from django.shortcuts import render, render_to_response
from django import forms
from .models import *
from django.contrib.auth.hashers import make_password, check_password
from django.http import HttpResponseRedirect, HttpResponse,JsonResponse
from django.urls import reverse
from django.core import signing,serializers
import json

# Create your views here.


class UserForm(forms.Form):
    username = forms.CharField(label='用户名', max_length=10)
    password = forms.CharField(label='密码', widget=forms.PasswordInput())


# 新建一个全局变量
users = {"username": "登录/注册",
         "style": "none",
         "lg":"lg"}

# 处理登录的方法
def login(request):
    if request.method == 'GET':
        return render(request, 'music_player/sign.html')
    if request.method == 'POST':
        data = UserForm(request.POST)
        if data.is_valid():
            # 获取到表单提交的值
            username = data.cleaned_data['username']
            password = data.cleaned_data['password']
            print(username, password)
            # 把表单中取到的值和数据库里做对比
            try:
                use = user.objects.get(username=username)
                check = check_password(password, use.password)
            except:
                use = None
                check = None
            # 判断对比是否成功
            if use and check:
                users["username"] = use.username
                users["style"] = ""
                users["lg"] = "" 
                ticket = signing.dumps(use.username)
                response = HttpResponseRedirect('/')
                # 创建cookie
                response.set_cookie('ticket', ticket, 3600)
                # 把cookie的值保存到数据库中
                use.ticket = ticket
                use.save()
                # 把cookie返回到游览器中
                return response
            else:
                return HttpResponseRedirect(reverse('music_player:index'))

# 注册相应的方法
def register(request):
    if request.method == 'GET':
        return render(request, 'music_player/sign.html')
    if request.method == 'POST':
        data = UserForm(request.POST)
        if data.is_valid():
            username = data.cleaned_data['username']
            password = data.cleaned_data['password']
            # 对密码进行加密处理，保存到数据中
            password = make_password(password)
            try:
                # 判断用户是否已经注册了
                registjudge = user.objects.filter(username=username).get()
                return HttpResponse('用户已经存在')
            except:
                # 把注册的数据保存到数据库中
                registadd = user.objects.create(
                    username=username,
                    password=password
                )
                use = user.objects.get(username=username)
                users["username"] = username
                users["style"] = ""
                users["lg"] = ""
                ticket = signing.dumps(username)
                response = HttpResponseRedirect(reverse('music_player:index'))
                # 创建cookie
                response.set_cookie('ticket', ticket, 3600)
                # 把cookie的值保存到数据库中
                use.ticket = ticket
                use.save()
                # 把cookie返回到游览器中
                return response

#退出登录的方法
def logout(request):  
    if request.method == 'GET':
        users["username"] = "登录/注册"
        users["style"] = "none"
        users["lg"] = "lg"
        response = HttpResponseRedirect('/')
        response.delete_cookie('ticket')
        return response

# 登录成功后进入的主页的方法
def index(request):
    if request.method == 'GET':
        # 获取到游览器中的cookie
        cookies = request.COOKIES.get('ticket')
        # 判断cookie是否存在
        if not cookies:
            users["username"] = "登录/注册"
            users["style"] = "none"
            users["lg"] = "lg"
            return render(request, 'music_player/index.html', users)
        # 把cookie里的值和数据库里的相对比,对比成功进入主页，否者返回登录界面
        if user.objects.filter(ticket=cookies).exists():
            u = user.objects.filter(ticket=cookies).get()
            users["username"] = u.username
            users["style"] = ""
            users["lg"] = ""
            return render(request, 'music_player/index.html', users)
        else:
            response = HttpResponseRedirect('/')
            response.delete_cookie('ticket')
            users["username"] = "登录/注册"
            users["style"] = "none"
            users["lg"] = "lg"
            return response

# 跳转登录/注册界面
def sign(request):
    return render(request, 'music_player/sign.html')

def upload(request):
    return render(request, 'music_player/upload.html')

def get_songs(request):
    obj = song.objects.all().values()
    obj = list(obj[:])
    for i in range(len(obj)):
        lrc_url = "media/"+obj[i]["lrc"]
        lrc = ""
        f = open(lrc_url,'r')
        for line in f:
            lrc = lrc + line
        f.close()
        obj[i]["lrc"] = lrc
        obj[i].pop("s_uuid")
    data = json.dumps(obj)
    return HttpResponse(data, content_type="application/json")
    
