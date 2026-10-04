from django.contrib import admin
from .models import Reservation


@admin.action(description="Marcar como Confirmada")
def confirm(modeladmin, request, queryset):
    queryset.update(status=Reservation.Status.CONFIRMED)


@admin.action(description="Marcar como Cancelada")
def cancel(modeladmin, request, queryset):
    queryset.update(status=Reservation.Status.CANCELLED)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "date", "time", "guests", "phone", "status")
    list_filter = ("status", "date")
    list_editable = ("status",)
    search_fields = ("full_name", "phone")
    actions = [confirm, cancel]