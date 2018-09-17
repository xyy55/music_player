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
    path('get_songs/',views.get_songs,name='get_songs'),
    path('add_songs/',views.add_songs,name="add_songs"),
    path('get_my_songs/',views.get_my_songs,name="get_my_songs"),
    path('search_songs/',views.search_songs,name="search_songs"),
    path('recommendation/',views.recommendation,name="recommendation"),
    path('make_recommendation/',views.make_recommendation,name="make_recommendation"),
    path('delete_songs/',views.delete_songs,name="delete_songs")
]