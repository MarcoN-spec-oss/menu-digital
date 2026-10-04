from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("dish_name", "unit_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "table_number", "customer_name", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("customer_name", "id")
    inlines = [OrderItemInline]