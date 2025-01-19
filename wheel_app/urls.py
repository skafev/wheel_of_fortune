from django.urls import path
from . import views

urlpatterns = [
    path('', views.wheel_view, name='wheel'),
]
