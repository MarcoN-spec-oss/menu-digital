from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import OrderViewSet, KitchenOrderViewSet

router = DefaultRouter()
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"kitchen", KitchenOrderViewSet, basename="kitchen")

urlpatterns = [
    path("", include(router.urls)),
]