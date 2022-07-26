from django.urls import path, re_path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    re_path(r'^model_predict$', views.model_predict, name='model_predict'),
]