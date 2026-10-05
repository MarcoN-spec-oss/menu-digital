from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related("items__dish__category").all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "table_number", "user"]
    search_fields = ["customer_name", "notes"]
    ordering_fields = ["created_at", "total", "status"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["create", "my_orders"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return self.queryset
        elif user.is_authenticated:
            return self.queryset.filter(user=user)
        else:
            # Para usuarios anónimos, filtrar por sesión (mesa)
            table_number = self.request.session.get("table_number")
            if table_number:
                return self.queryset.filter(table_number=table_number, user__isnull=True)
            return Order.objects.none()

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def my_orders(self, request):
        """Pedidos del usuario actual o de la mesa en sesión"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def set_status(self, request, pk=None):
        """Cambiar estado del pedido (solo staff)"""
        if not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in Order.Status.values:
            return Response({"detail": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save(update_fields=["status"])
        serializer = self.get_serializer(order)
        return Response(serializer.data)


class KitchenOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Vista para el panel de cocina - solo pedidos PENDING y PREPARING"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    ordering = ["created_at"]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return Order.objects.none()
        return Order.objects.filter(
            status__in=[Order.Status.PENDING, Order.Status.PREPARING]
        ).prefetch_related("items__dish__category")

    @action(detail=False, methods=["get"])
    def pending(self, request):
        orders = self.get_queryset().filter(status=Order.Status.PENDING)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def preparing(self, request):
        orders = self.get_queryset().filter(status=Order.Status.PREPARING)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)