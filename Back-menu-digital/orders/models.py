from decimal import Decimal

from django.conf import settings
from django.db import models

from menu.models import Dish


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendiente"
        PREPARING = "PREPARING", "En preparación"
        SERVED = "SERVED", "Servido"
        PAID = "PAID", "Pagado"
        CANCELLED = "CANCELLED", "Cancelado"

    # Cliente registrado (opcional: el invitado QR no tiene usuario)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="orders", verbose_name="Cliente",
    )
    customer_name = models.CharField("Nombre del comensal", max_length=100, blank=True)
    table_number = models.PositiveSmallIntegerField("Mesa")
    status = models.CharField(
        "Estado", max_length=12, choices=Status.choices, default=Status.PENDING,
    )
    notes = models.TextField("Observaciones", blank=True)
    total = models.DecimalField(
        "Total (S/)", max_digits=10, decimal_places=2, default=Decimal("0.00"),
    )
    created_at = models.DateTimeField("Creado", auto_now_add=True)
    updated_at = models.DateTimeField("Actualizado", auto_now=True)

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pedido #{self.pk} - Mesa {self.table_number}"

    def recalculate_total(self):
        """Recalcula y guarda el total a partir de los ítems."""
        self.total = sum((item.subtotal for item in self.items.all()), Decimal("0.00"))
        self.save(update_fields=["total"])
        return self.total


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items",
    )
    # PROTECT: no se puede borrar un plato que ya fue vendido.
    # Para "retirar" un plato usa is_available=False.
    dish = models.ForeignKey(
        Dish, on_delete=models.PROTECT, related_name="order_items",
        verbose_name="Platillo",
    )
    dish_name = models.CharField(
        "Nombre (histórico)", max_length=120, editable=False,
    )
    unit_price = models.DecimalField(
        "Precio unitario (S/)", max_digits=8, decimal_places=2, editable=False,
    )
    quantity = models.PositiveSmallIntegerField("Cantidad", default=1)

    class Meta:
        verbose_name = "Ítem del pedido"
        verbose_name_plural = "Ítems del pedido"

    def save(self, *args, **kwargs):
        # Congela precio y nombre al crear el ítem
        if not self.pk:
            self.unit_price = self.dish.price
            self.dish_name = self.dish.name
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.dish_name}"