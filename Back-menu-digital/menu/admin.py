from django.contrib import admin
from .models import Category, Dish


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active")
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_available")
    list_editable = ("price", "is_available")
    list_filter = ("category", "is_available")
    search_fields = ("name", "description")