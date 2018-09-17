from django.shortcuts import render, render_to_response
from django import forms
from .models import *
from django.contrib.auth.hashers import make_password, check_password
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.core import signing, serializers
import json
from .recommendation import my_apriori

# Create your views here.


class UserForm(forms.Form):
    username = forms.CharField(label='用户名', max_length=10)
    password = forms.CharField(label='密码', widget=forms.PasswordInput())


# 新建一个全局变量
users = {"username": "登录/注册",
         "style": "none",
         "lg": "lg"}

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
                return render(request, 'music_player/sign.html', {"warn":"用户名已经存在!"})
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

# 退出登录的方法
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
        f = open(lrc_url, 'r')
        for line in f:
            lrc = lrc + line
        f.close()
        obj[i]["lrc"] = lrc
        obj[i].pop("s_uuid")
    data = json.dumps(obj)
    return HttpResponse(data, content_type="application/json")


def add_songs(request):
    if request.method == 'POST':
        data = request.POST.dict()
        cookies = request.COOKIES.get('ticket')
        if cookies:
            u = user.objects.filter(ticket=cookies).get()
            songs = song.objects.filter(user_song__user_id=u.username)
            sg = song.objects.all().values()[:][int(data["num"])]
            for s in songs:
                if s.s_uuid == sg["s_uuid"]:
                    return HttpResponse("304", content_type="application/json")
            song_id = str(sg["s_uuid"])
            s = song.objects.filter(s_uuid=song_id).get()
            listadd = user_song.objects.create(
                user_id=u,
                song_id=s
            )
    return HttpResponse("200", content_type="application/json")


def get_my_songs(request):
    if request.method == 'GET':
        cookies = request.COOKIES.get('ticket')
        u = user.objects.filter(ticket=cookies).get()
        data = song.objects.filter(user_song__user_id=u.username)
        data = list(data[:])
        d = []
        for i in range(len(data)):
            dic = forms.models.model_to_dict(data[i])
            lrc_url = "media/"+str(dic["lrc"])
            lrc = ""
            f = open(lrc_url, 'r')
            for line in f:
                lrc = lrc + line
            f.close()
            dic["lrc"] = lrc
            dic["mp3"] = str(dic["mp3"])
            dic["image"] = str(dic["image"])
            d.append(dic)
        d = json.dumps(d)
    return HttpResponse(d, content_type="application/json")

def search_songs(request):
    if request.method == 'POST':
        data = request.POST.dict()
        songs = song.objects.filter(s_name=data["data"])
        d = []
        if len(songs) == 0:
            return HttpResponse("304", content_type="application/json")
        else:
            for i in range(len(songs)):
                dic = forms.models.model_to_dict(songs[i])
                lrc_url = "media/"+str(dic["lrc"])
                lrc = ""
                f = open(lrc_url, 'r')
                for line in f:
                    lrc = lrc + line
                f.close()
                dic["lrc"] = lrc
                dic["mp3"] = str(dic["mp3"])
                dic["image"] = str(dic["image"])
                d.append(dic)
            d = json.dumps(d)
            return HttpResponse(d, content_type="application/json")

    return HttpResponse()

def recommendation(request):
    if request.method == 'POST':
        cookies = request.COOKIES.get('ticket')
        rules = list(association_rules.objects.all())
        u = user.objects.filter(ticket=cookies).get()
        s = song.objects.filter(user_song__user_id=u.username)
        song_id = []
        rec_songs = []
        d = []
        for i in s:
            song_id.append(str(i.s_uuid))
        for rule in rules:
            ant = rule.antecedent
            con = rule.consequent
            if "," in ant:
                ant = ant.split(",")
            if type(ant) == str:
                if ant in song_id and con not in song_id:
                    if con not in rec_songs:
                        rec_songs.append(con)
            else:
                if set(ant).issubset(set(song_id)) and con not in song_id:
                    if con not in rec_songs:
                        rec_songs.append(con)
            
        if len(rec_songs)==0:
            return HttpResponse("304", content_type="application/json")
        else:
            for i in rec_songs:
                r_s = song.objects.filter(s_uuid=i).get()
                dic = forms.models.model_to_dict(r_s)
                lrc_url = "media/"+str(dic["lrc"])
                lrc = ""
                f = open(lrc_url, 'r')
                for line in f:
                    lrc = lrc + line
                f.close()
                dic["lrc"] = lrc
                dic["mp3"] = str(dic["mp3"])
                dic["image"] = str(dic["image"])
                d.append(dic)
            d = json.dumps(d)
            return HttpResponse(d, content_type="application/json")
    return HttpResponse()

def make_recommendation(request):
    users = user.objects.all()
    items = []
    for u in users:
        item = []
        for s in song.objects.filter(user_song__user_id=u):
            item.append(str(s.s_uuid))
        items.append(item)
    a = my_apriori(items, 0.2, 0.6)
    for key in a.confidence_select.keys():
        association = key.split("-->")
        if len(association_rules.objects.filter(antecedent=association[0],consequent=association[1])) == 0:
            associationadd = association_rules.objects.create(
                antecedent=association[0],
                consequent=association[1]
            )
        else:
            print("该规则数据库中已经存在！")
    return HttpResponse()
