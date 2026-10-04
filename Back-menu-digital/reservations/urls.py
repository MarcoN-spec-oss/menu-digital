from django.urls import path

from . import views

app_name = "reservations"

urlpatterns = [
    path("", views.reservation_create, name="create"),
    path("mis-reservas/", views.my_reservations, name="mine"),
    path("cancelar/<int:pk>/", views.reservation_cancel, name="cancel"),
    path("gestion/", views.reservation_manage, name="manage"),
    path("gestion/<int:pk>/estado/", views.reservation_set_status, name="set_status"),
]