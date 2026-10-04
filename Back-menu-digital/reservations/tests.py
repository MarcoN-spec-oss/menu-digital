from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .forms import ReservationForm
from .models import Reservation

User = get_user_model()


def form_data(**overrides):
    tomorrow = timezone.localdate() + timedelta(days=1)
    data = {
        "full_name": "Cliente de Prueba",
        "phone": "999888777",
        "email": "",
        "date": tomorrow.isoformat(),
        "time": "20:00",
        "guests": 4,
        "special_notes": "",
    }
    data.update(overrides)
    return data


def make_reservation(**overrides):
    values = {
        "full_name": "Cliente de Prueba",
        "phone": "999888777",
        "date": timezone.localdate() + timedelta(days=1),
        "time": time(20, 0),
        "guests": 2,
    }
    values.update(overrides)
    return Reservation.objects.create(**values)


class ReservationFormTests(TestCase):
    def test_datos_validos(self):
        self.assertTrue(ReservationForm(data=form_data()).is_valid())

    def test_fecha_pasada_es_invalida(self):
        ayer = timezone.localdate() - timedelta(days=1)
        form = ReservationForm(data=form_data(date=ayer.isoformat()))
        self.assertFalse(form.is_valid())
        self.assertIn("date", form.errors)

    def test_hora_ya_pasada_es_invalida(self):
        hace_un_minuto = timezone.localtime() - timedelta(minutes=1)
        form = ReservationForm(
            data=form_data(
                date=hace_un_minuto.date().isoformat(),
                time=hace_un_minuto.strftime("%H:%M"),
            )
        )
        self.assertFalse(form.is_valid())

    def test_comensales_fuera_de_rango(self):
        for guests in [0, 21]:
            form = ReservationForm(data=form_data(guests=guests))
            self.assertFalse(form.is_valid(), f"guests={guests} debería ser inválido")
            self.assertIn("guests", form.errors)


class ReservationModelTests(TestCase):
    def test_estado_inicial_es_pendiente(self):
        self.assertEqual(make_reservation().status, Reservation.Status.PENDING)

    def test_reserva_nueva_en_el_pasado_no_pasa_la_validacion(self):
        reserva = Reservation(
            full_name="Cliente", phone="999",
            date=timezone.localdate() - timedelta(days=1),
            time=time(12, 0), guests=2,
        )
        with self.assertRaises(ValidationError):
            reserva.full_clean()

    def test_reserva_pasada_ya_guardada_se_puede_editar(self):
        # Caso del admin: cambiar el estado de una reserva que ya pasó
        reserva = make_reservation(date=timezone.localdate() - timedelta(days=3))
        reserva.status = Reservation.Status.CANCELLED
        reserva.full_clean()  # no debe lanzar error
        reserva.save()


class ReservationViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.cliente = User.objects.create_user("cliente", password="Clave-Segura-1")
        cls.otro = User.objects.create_user("otro", password="Clave-Segura-1")
        cls.staff = User.objects.create_user(
            "mesero", password="Clave-Segura-1", is_staff=True
        )

    def test_invitado_puede_reservar(self):
        response = self.client.post(reverse("reservations:create"), form_data())
        self.assertRedirects(response, reverse("menu:list"))
        reserva = Reservation.objects.get()
        self.assertIsNone(reserva.user)
        self.assertEqual(reserva.status, Reservation.Status.PENDING)

    def test_cliente_logueado_queda_asociado_y_va_a_sus_reservas(self):
        self.client.force_login(self.cliente)
        response = self.client.post(reverse("reservations:create"), form_data())
        self.assertRedirects(response, reverse("reservations:mine"))
        self.assertEqual(Reservation.objects.get().user, self.cliente)

    def test_reserva_invalida_no_se_guarda(self):
        ayer = timezone.localdate() - timedelta(days=1)
        response = self.client.post(
            reverse("reservations:create"), form_data(date=ayer.isoformat())
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Reservation.objects.count(), 0)

    def test_mis_reservas_requiere_login(self):
        url = reverse("reservations:mine")
        response = self.client.get(url)
        self.assertRedirects(response, f"{reverse('accounts:login')}?next={url}")

    def test_cliente_cancela_su_reserva(self):
        reserva = make_reservation(user=self.cliente)
        self.client.force_login(self.cliente)
        self.client.post(reverse("reservations:cancel", args=[reserva.pk]))
        reserva.refresh_from_db()
        self.assertEqual(reserva.status, Reservation.Status.CANCELLED)

    def test_cliente_no_puede_cancelar_reserva_ajena(self):
        reserva = make_reservation(user=self.cliente)
        self.client.force_login(self.otro)
        response = self.client.post(reverse("reservations:cancel", args=[reserva.pk]))
        self.assertEqual(response.status_code, 404)
        reserva.refresh_from_db()
        self.assertEqual(reserva.status, Reservation.Status.PENDING)

    def test_panel_de_gestion_solo_para_staff(self):
        url = reverse("reservations:manage")
        self.assertEqual(self.client.get(url).status_code, 302)
        self.client.force_login(self.cliente)
        self.assertEqual(self.client.get(url).status_code, 302)
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get(url).status_code, 200)

    def test_gestion_filtra_por_estado(self):
        pendiente = make_reservation()
        confirmada = make_reservation(status=Reservation.Status.CONFIRMED)
        self.client.force_login(self.staff)
        response = self.client.get(reverse("reservations:manage"), {"estado": "CONFIRMED"})
        self.assertEqual(list(response.context["reservations"]), [confirmada])
        self.assertNotIn(pendiente, list(response.context["reservations"]))

    def test_staff_confirma_una_reserva(self):
        reserva = make_reservation()
        self.client.force_login(self.staff)
        self.client.post(
            reverse("reservations:set_status", args=[reserva.pk]), {"status": "CONFIRMED"}
        )
        reserva.refresh_from_db()
        self.assertEqual(reserva.status, Reservation.Status.CONFIRMED)

    def test_cliente_normal_no_puede_cambiar_estados(self):
        reserva = make_reservation(user=self.cliente)
        self.client.force_login(self.cliente)
        self.client.post(
            reverse("reservations:set_status", args=[reserva.pk]), {"status": "CONFIRMED"}
        )
        reserva.refresh_from_db()
        self.assertEqual(reserva.status, Reservation.Status.PENDING)

    def test_estado_invalido_se_ignora(self):
        reserva = make_reservation()
        self.client.force_login(self.staff)
        self.client.post(
            reverse("reservations:set_status", args=[reserva.pk]), {"status": "XYZ"}
        )
        reserva.refresh_from_db()
        self.assertEqual(reserva.status, Reservation.Status.PENDING)