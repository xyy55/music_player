from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(user)
admin.site.register(song)
admin.site.register(user_song)
admin.site.register(association_rules)