from decimal import Decimal

from django.test import TestCase
from django.urls import reverse

from .models import Category, Dish


class CategoryModelTests(TestCase):
    def test_slug_se_genera_automaticamente(self):
        category = Category.objects.create(name="Platos a la Carta")
        self.assertEqual(category.slug, "platos-a-la-carta")


class MenuViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.bebidas = Category.objects.create(name="Bebidas", order=2)
        cls.fondos = Category.objects.create(name="Platos a la Carta", order=1)
        cls.limonada = Dish.objects.create(
            category=cls.bebidas, name="Limonada", description="Fresca y helada",
            price=Decimal("7.00"),
        )
        cls.lomo = Dish.objects.create(
            category=cls.fondos, name="Lomo saltado", description="Con papas fritas",
            price=Decimal("32.00"),
        )
        cls.agotado = Dish.objects.create(
            category=cls.fondos, name="Ceviche", price=Decimal("35.00"),
            is_available=False,
        )
        cls.url = reverse("menu:list")

    def test_lista_muestra_solo_platos_disponibles(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        dishes = list(response.context["dishes"])
        self.assertIn(self.lomo, dishes)
        self.assertIn(self.limonada, dishes)
        self.assertNotIn(self.agotado, dishes)

    def test_platos_se_ordenan_por_orden_de_categoria(self):
        response = self.client.get(self.url)
        dishes = list(response.context["dishes"])
        # Platos a la Carta (orden 1) va antes que Bebidas (orden 2)
        self.assertEqual(dishes, [self.lomo, self.limonada])

    def test_filtro_por_categoria(self):
        response = self.client.get(self.url, {"categoria": self.bebidas.slug})
        self.assertEqual(list(response.context["dishes"]), [self.limonada])

    def test_busqueda_por_nombre(self):
        response = self.client.get(self.url, {"q": "lomo"})
        self.assertEqual(list(response.context["dishes"]), [self.lomo])

    def test_busqueda_por_descripcion(self):
        response = self.client.get(self.url, {"q": "helada"})
        self.assertEqual(list(response.context["dishes"]), [self.limonada])

    def test_busqueda_sin_resultados(self):
        response = self.client.get(self.url, {"q": "zzzz"})
        self.assertEqual(list(response.context["dishes"]), [])

    def test_categoria_inactiva_oculta_sus_platos(self):
        self.bebidas.is_active = False
        self.bebidas.save()
        response = self.client.get(self.url)
        self.assertNotIn(self.limonada, list(response.context["dishes"]))