from decimal import Decimal

from django.core.management.base import BaseCommand

from menu.models import Category, Dish

# (nombre de categoría, orden): [(plato, descripción, precio), ...]
DATA = {
    ("Menú Ejecutivo", 1): [
        ("Menú del día: sopa + lomo saltado", "Sopa del día, lomo saltado con arroz y refresco.", "15.00"),
        ("Menú del día: sopa + ají de gallina", "Sopa del día, ají de gallina con arroz y refresco.", "14.00"),
        ("Menú del día: entrada + trucha frita", "Entrada del día, trucha frita con arroz y ensalada.", "16.00"),
    ],
    ("Platos a la Carta", 2): [
        ("Lomo saltado", "Trozos de lomo fino salteados con cebolla, tomate y papas fritas.", "32.00"),
        ("Ají de gallina", "Crema de ají amarillo con pollo deshilachado, arroz y papa.", "26.00"),
        ("Ceviche clásico", "Pescado fresco en leche de tigre, con camote y choclo.", "35.00"),
        ("Trucha frita", "Trucha entera frita con arroz, ensalada y papas.", "30.00"),
        ("Tallarines verdes con bistec", "Tallarines en salsa de albahaca y espinaca con bistec.", "28.00"),
    ],
    ("Bebidas", 3): [
        ("Chicha morada (jarra)", "Jarra de chicha morada helada.", "12.00"),
        ("Limonada", "Limonada fresca, vaso grande.", "7.00"),
        ("Jugo de maracuyá", "Jugo natural de maracuyá.", "8.00"),
        ("Gaseosa personal", "Botella personal de 500 ml.", "4.00"),
    ],
    ("Postres", 4): [
        ("Suspiro a la limeña", "Manjar blanco con merengue al oporto.", "10.00"),
        ("Mazamorra morada", "Mazamorra tradicional con arroz con leche.", "8.00"),
        ("Torta de tres leches", "Porción de torta empapada en tres leches.", "12.00"),
    ],
}


class Command(BaseCommand):
    help = "Carga categorías y platillos de ejemplo (se puede ejecutar varias veces sin duplicar)."

    def handle(self, *args, **options):
        total = 0
        for (cat_name, cat_order), dishes in DATA.items():
            category, _ = Category.objects.get_or_create(
                name=cat_name, defaults={"order": cat_order, "is_active": True}
            )
            for name, description, price in dishes:
                Dish.objects.update_or_create(
                    category=category,
                    name=name,
                    defaults={
                        "description": description,
                        "price": Decimal(price),
                        "is_available": True,
                    },
                )
                total += 1
        self.stdout.write(
            self.style.SUCCESS(f"Listo: {len(DATA)} categorías y {total} platillos cargados.")
        )