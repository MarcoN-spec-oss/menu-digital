from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import ProtectedError
from django.test import Client, TestCase
from django.urls import reverse

from menu.models import Category, Dish

from .models import Order, OrderItem

User = get_user_model()


class BaseOrderTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        category = Category.objects.create(name="Carta")
        cls.lomo = Dish.objects.create(
            category=category, name="Lomo saltado", price=Decimal("32.00")
        )
        cls.chicha = Dish.objects.create(
            category=category, name="Chicha", price=Decimal("12.00")
        )
        cls.agotado = Dish.objects.create(
            category=category, name="Ceviche", price=Decimal("35.00"),
            is_available=False,
        )
        cls.staff = User.objects.create_user(
            "cocinero", password="Clave-Segura-1", is_staff=True
        )
        cls.cliente = User.objects.create_user("cliente", password="Clave-Segura-1")

    def add_to_cart(self, dish, times=1):
        for _ in range(times):
            self.client.post(reverse("orders:add", args=[dish.pk]))


class OrderModelTests(BaseOrderTest):
    def test_estado_inicial_es_pendiente(self):
        order = Order.objects.create(table_number=1)
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_item_congela_precio_y_nombre(self):
        order = Order.objects.create(table_number=1)
        item = OrderItem.objects.create(order=order, dish=self.lomo, quantity=2)
        self.lomo.price = Decimal("50.00")
        self.lomo.name = "Lomo especial"
        self.lomo.save()
        item.refresh_from_db()
        self.assertEqual(item.unit_price, Decimal("32.00"))
        self.assertEqual(item.dish_name, "Lomo saltado")
        self.assertEqual(item.subtotal, Decimal("64.00"))

    def test_recalculate_total(self):
        order = Order.objects.create(table_number=2)
        OrderItem.objects.create(order=order, dish=self.lomo, quantity=2)
        OrderItem.objects.create(order=order, dish=self.chicha, quantity=1)
        self.assertEqual(order.recalculate_total(), Decimal("76.00"))
        order.refresh_from_db()
        self.assertEqual(order.total, Decimal("76.00"))

    def test_no_se_puede_borrar_un_plato_ya_vendido(self):
        order = Order.objects.create(table_number=1)
        OrderItem.objects.create(order=order, dish=self.lomo, quantity=1)
        with self.assertRaises(ProtectedError):
            self.lomo.delete()


class TableQRTests(TestCase):
    def test_mesa_en_la_url_se_guarda_en_sesion(self):
        self.client.get(reverse("menu:list"), {"mesa": "7"})
        self.assertEqual(self.client.session["table_number"], 7)

    def test_mesa_persiste_en_las_siguientes_peticiones(self):
        self.client.get(reverse("menu:list"), {"mesa": "4"})
        self.client.get(reverse("menu:list"))
        self.assertEqual(self.client.session["table_number"], 4)

    def test_mesa_invalida_se_ignora(self):
        for valor in ["abc", "0", "100", "-3", ""]:
            self.client.get(reverse("menu:list"), {"mesa": valor})
        self.assertNotIn("table_number", self.client.session)


class CartTests(BaseOrderTest):
    def test_anadir_plato_dos_veces_suma_cantidad(self):
        self.add_to_cart(self.lomo, times=2)
        self.assertEqual(self.client.session["cart"], {str(self.lomo.pk): 2})

    def test_no_se_puede_anadir_plato_agotado(self):
        response = self.client.post(reverse("orders:add", args=[self.agotado.pk]))
        self.assertEqual(response.status_code, 404)
        self.assertNotIn("cart", self.client.session)

    def test_anadir_requiere_post(self):
        response = self.client.get(reverse("orders:add", args=[self.lomo.pk]))
        self.assertEqual(response.status_code, 405)

    def test_anadir_por_ajax_devuelve_json_con_contador(self):
        response = self.client.post(
            reverse("orders:add", args=[self.lomo.pk]),
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_total_del_carrito(self):
        self.add_to_cart(self.lomo, times=2)
        self.add_to_cart(self.chicha, times=1)
        response = self.client.get(reverse("orders:cart"))
        cart = response.context["cart"]
        self.assertEqual(len(cart), 3)
        self.assertEqual(cart.total(), Decimal("76.00"))

    def test_actualizar_cantidad(self):
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:update", args=[self.lomo.pk]), {"quantity": 5})
        self.assertEqual(self.client.session["cart"][str(self.lomo.pk)], 5)

    def test_cantidad_cero_quita_el_plato(self):
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:update", args=[self.lomo.pk]), {"quantity": 0})
        self.assertEqual(self.client.session.get("cart", {}), {})

    def test_cantidad_maxima_por_plato(self):
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:update", args=[self.lomo.pk]), {"quantity": 99})
        self.assertEqual(self.client.session["cart"][str(self.lomo.pk)], 20)

    def test_quitar_plato(self):
        self.add_to_cart(self.lomo)
        self.add_to_cart(self.chicha)
        self.client.post(reverse("orders:remove", args=[self.lomo.pk]))
        self.assertEqual(self.client.session["cart"], {str(self.chicha.pk): 1})


class CheckoutTests(BaseOrderTest):
    def test_carrito_vacio_redirige_al_menu(self):
        response = self.client.get(reverse("orders:checkout"))
        self.assertRedirects(response, reverse("menu:list"))

    def test_crea_pedido_con_items_y_total(self):
        self.add_to_cart(self.lomo, times=2)
        self.add_to_cart(self.chicha)
        response = self.client.post(
            reverse("orders:checkout"),
            {"table_number": 5, "customer_name": "Ana", "notes": ""},
        )
        order = Order.objects.get()
        self.assertRedirects(response, reverse("orders:confirmation", args=[order.pk]))
        self.assertEqual(order.table_number, 5)
        self.assertEqual(order.customer_name, "Ana")
        self.assertEqual(order.total, Decimal("76.00"))
        self.assertEqual(order.items.count(), 2)
        self.assertIsNone(order.user)
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_vacia_el_carrito_y_registra_el_pedido_en_sesion(self):
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:checkout"), {"table_number": 3})
        order = Order.objects.get()
        self.assertNotIn("cart", self.client.session)
        self.assertIn(order.pk, self.client.session["order_ids"])

    def test_precio_congelado_aunque_cambie_el_plato(self):
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:checkout"), {"table_number": 3})
        self.lomo.price = Decimal("99.00")
        self.lomo.save()
        item = OrderItem.objects.get()
        self.assertEqual(item.unit_price, Decimal("32.00"))

    def test_usuario_autenticado_queda_asociado_al_pedido(self):
        self.client.force_login(self.cliente)
        self.add_to_cart(self.lomo)
        self.client.post(reverse("orders:checkout"), {"table_number": 2})
        self.assertEqual(Order.objects.get().user, self.cliente)

    def test_mesa_del_qr_llega_como_valor_inicial(self):
        self.client.get(reverse("menu:list"), {"mesa": "9"})
        self.add_to_cart(self.lomo)
        response = self.client.get(reverse("orders:checkout"))
        self.assertEqual(response.context["form"].initial["table_number"], 9)

    def test_mesa_fuera_de_rango_no_crea_pedido(self):
        self.add_to_cart(self.lomo)
        for mesa in [0, 100]:
            response = self.client.post(reverse("orders:checkout"), {"table_number": mesa})
            self.assertEqual(response.status_code, 200)
            self.assertIn("table_number", response.context["form"].errors)
        self.assertEqual(Order.objects.count(), 0)

    def test_mesa_es_obligatoria(self):
        self.add_to_cart(self.lomo)
        response = self.client.post(reverse("orders:checkout"), {"customer_name": "Ana"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.count(), 0)


class OrderAccessTests(BaseOrderTest):
    def test_invitado_no_puede_ver_pedido_ajeno(self):
        order = Order.objects.create(table_number=1)
        response = Client().get(reverse("orders:confirmation", args=[order.pk]))
        self.assertEqual(response.status_code, 404)

    def test_cliente_ve_su_propio_pedido(self):
        order = Order.objects.create(table_number=1, user=self.cliente)
        self.client.force_login(self.cliente)
        response = self.client.get(reverse("orders:confirmation", args=[order.pk]))
        self.assertEqual(response.status_code, 200)

    def test_otro_cliente_no_ve_el_pedido(self):
        order = Order.objects.create(table_number=1, user=self.cliente)
        otro = User.objects.create_user("otro", password="Clave-Segura-1")
        self.client.force_login(otro)
        response = self.client.get(reverse("orders:confirmation", args=[order.pk]))
        self.assertEqual(response.status_code, 404)

    def test_staff_puede_ver_cualquier_pedido(self):
        order = Order.objects.create(table_number=1)
        self.client.force_login(self.staff)
        response = self.client.get(reverse("orders:confirmation", args=[order.pk]))
        self.assertEqual(response.status_code, 200)

    def test_mis_pedidos_requiere_login(self):
        url = reverse("orders:mine")
        response = self.client.get(url)
        self.assertRedirects(response, f"{reverse('accounts:login')}?next={url}")

    def test_mis_pedidos_solo_muestra_los_propios(self):
        mio = Order.objects.create(table_number=1, user=self.cliente)
        Order.objects.create(table_number=2)  # de un invitado
        self.client.force_login(self.cliente)
        response = self.client.get(reverse("orders:mine"))
        self.assertEqual(list(response.context["orders"]), [mio])


class KitchenPanelTests(BaseOrderTest):
    def test_anonimo_no_entra_al_panel(self):
        response = self.client.get(reverse("orders:kitchen"))
        self.assertEqual(response.status_code, 302)

    def test_cliente_normal_no_entra_al_panel(self):
        self.client.force_login(self.cliente)
        response = self.client.get(reverse("orders:kitchen"))
        self.assertEqual(response.status_code, 302)

    def test_staff_ve_pedidos_pendientes_y_en_preparacion(self):
        pendiente = Order.objects.create(table_number=1)
        preparando = Order.objects.create(table_number=2, status=Order.Status.PREPARING)
        Order.objects.create(table_number=3, status=Order.Status.SERVED)
        self.client.force_login(self.staff)
        response = self.client.get(reverse("orders:kitchen"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["pending"], [pendiente])
        self.assertEqual(response.context["preparing"], [preparando])

    def test_staff_cambia_el_estado(self):
        order = Order.objects.create(table_number=1)
        self.client.force_login(self.staff)
        self.client.post(
            reverse("orders:set_status", args=[order.pk]), {"status": "PREPARING"}
        )
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PREPARING)

    def test_cliente_normal_no_puede_cambiar_el_estado(self):
        order = Order.objects.create(table_number=1)
        self.client.force_login(self.cliente)
        self.client.post(
            reverse("orders:set_status", args=[order.pk]), {"status": "SERVED"}
        )
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_estado_invalido_se_ignora(self):
        order = Order.objects.create(table_number=1)
        self.client.force_login(self.staff)
        self.client.post(
            reverse("orders:set_status", args=[order.pk]), {"status": "HACKEADO"}
        )
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)