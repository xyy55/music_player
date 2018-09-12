from django.urls import path

from . import views

app_name = 'music_player'
urlpatterns = [
    path('', views.index, name='index'),
    path('sign/',views.sign,name='sign'),
    path('register/',views.register,name='register'),
    path('login/',views.login,name='login'),
    path('logout/',views.logout,name='logout'),
    path('upload/',views.upload,name='upload'),
    path('get_songs/',views.get_songs,name='get_songs')
]