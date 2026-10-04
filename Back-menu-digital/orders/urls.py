from django.urls import path

from . import views

app_name = "orders"

urlpatterns = [
    path("carrito/", views.cart_detail, name="cart"),
    path("agregar/<int:dish_id>/", views.cart_add, name="add"),
    path("actualizar/<int:dish_id>/", views.cart_update, name="update"),
    path("quitar/<int:dish_id>/", views.cart_remove, name="remove"),
    path("confirmar/", views.checkout, name="checkout"),
    path("gracias/<int:pk>/", views.order_confirmation, name="confirmation"),
    path("mis-pedidos/", views.my_orders, name="mine"),
    # Cocina (staff)
    path("cocina/", views.kitchen_panel, name="kitchen"),
    path("cocina/<int:pk>/estado/", views.order_set_status, name="set_status"),
]