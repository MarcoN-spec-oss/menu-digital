from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField("Nombre", max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    order = models.PositiveSmallIntegerField(
        "Orden de aparición", default=0,
        help_text="Menor número = aparece primero.",
    )
    is_active = models.BooleanField("Activa", default=True)

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Dish(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="dishes",
        verbose_name="Categoría",
    )
    name = models.CharField("Nombre", max_length=120)
    description = models.TextField("Descripción", blank=True)
    price = models.DecimalField("Precio (S/)", max_digits=8, decimal_places=2)
    image = models.ImageField("Imagen", upload_to="dishes/", blank=True, null=True)
    is_available = models.BooleanField(
        "Disponible", default=True,
        help_text="Desmarca si el plato se agotó.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Platillo"
        verbose_name_plural = "Platillos"
        ordering = ["category__order", "name"]
        indexes = [models.Index(fields=["is_available", "category"])]

    def __str__(self):
        return f"{self.name} - S/ {self.price}"