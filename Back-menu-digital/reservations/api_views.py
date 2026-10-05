from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "date", "guests"]
    search_fields = ["full_name", "phone", "email"]
    ordering_fields = ["date", "time", "created_at"]
    ordering = ["-date", "-time"]

    def get_permissions(self):
        if self.action in ["create", "my_reservations", "cancel"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return ReservationCreateSerializer
        return ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return self.queryset
        elif user.is_authenticated:
            return self.queryset.filter(user=user)
        else:
            # Para usuarios anónimos, no mostrar nada (requiere login para ver sus reservas)
            return Reservation.objects.none()

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def my_reservations(self, request):
        """Reservas del usuario actual"""
        if request.user.is_authenticated:
            queryset = self.get_queryset()
        else:
            # Para anónimos, podríamos usar sesión o email/phone
            queryset = Reservation.objects.none()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def cancel(self, request, pk=None):
        """Cancelar reserva (propietario o staff)"""
        reservation = self.get_object()
        user = request.user

        if user.is_authenticated and (user.is_staff or reservation.user == user):
            pass  # Autorizado
        elif not user.is_authenticated:
            # Verificar ownership por email/phone si no está autenticado
            email = request.data.get("email")
            phone = request.data.get("phone")
            if email and reservation.email == email:
                pass
            elif phone and reservation.phone == phone:
                pass
            else:
                return Response(
                    {"detail": "No autorizado. Proporcione email o teléfono."},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if reservation.status == Reservation.Status.CANCELLED:
            return Response(
                {"detail": "La reserva ya está cancelada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.status = Reservation.Status.CANCELLED
        reservation.save(update_fields=["status"])
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def set_status(self, request, pk=None):
        """Cambiar estado (solo staff)"""
        if not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        reservation = self.get_object()
        new_status = request.data.get("status")
        if new_status not in Reservation.Status.values:
            return Response({"detail": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = new_status
        reservation.save(update_fields=["status"])
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)