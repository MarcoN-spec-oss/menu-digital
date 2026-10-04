from datetime import datetime

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendiente"
        CONFIRMED = "CONFIRMED", "Confirmada"
        CANCELLED = "CANCELLED", "Cancelada"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="reservations", verbose_name="Cliente",
    )
    full_name = models.CharField("Nombre completo", max_length=120)
    phone = models.CharField("Teléfono", max_length=20)
    email = models.EmailField("Correo", blank=True)
    date = models.DateField("Fecha")
    time = models.TimeField("Hora")
    guests = models.PositiveSmallIntegerField(
        "Comensales",
        validators=[MinValueValidator(1), MaxValueValidator(20)],
    )
    special_notes = models.TextField("Notas especiales", blank=True)
    status = models.CharField(
        "Estado", max_length=10, choices=Status.choices, default=Status.PENDING,
    )
    created_at = models.DateTimeField("Creada", auto_now_add=True)

    class Meta:
        verbose_name = "Reservación"
        verbose_name_plural = "Reservaciones"
        ordering = ["date", "time"]

    def clean(self):
        # Solo se valida al crear: así se puede cambiar el estado de una reserva pasada
        if self._state.adding and self.date and self.time:
            reserved_at = timezone.make_aware(datetime.combine(self.date, self.time))
            if reserved_at < timezone.now():
                raise ValidationError("La reserva debe ser para una fecha y hora futuras.")

    def __str__(self):
        return f"{self.full_name} - {self.date} {self.time:%H:%M} ({self.guests} pers.)"