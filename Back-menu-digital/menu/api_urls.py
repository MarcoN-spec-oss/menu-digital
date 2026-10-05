from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import CategoryViewSet, DishViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"dishes", DishViewSet, basename="dish")

urlpatterns = [
    path("", include(router.urls)),
]