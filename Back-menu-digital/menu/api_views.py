from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Dish
from .serializers import CategorySerializer, DishSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("order", "name")
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["order", "name"]


class DishViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dish.objects.select_related("category").filter(is_available=True).order_by("category__order", "name")
    serializer_class = DishSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "category__slug", "is_available"]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "name"]

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Platillos destacados (los primeros 6)"""
        dishes = self.get_queryset()[:6]
        serializer = self.get_serializer(dishes, many=True, context={"request": request})
        return Response(serializer.data)