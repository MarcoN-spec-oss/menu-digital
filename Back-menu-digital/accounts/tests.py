from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

User = get_user_model()

PASSWORD = "Tr4ns#Segura2026"


class AccountsTests(TestCase):
    def test_registro_crea_usuario_e_inicia_sesion(self):
        response = self.client.post(
            reverse("accounts:register"),
            {"username": "cliente1", "password1": PASSWORD, "password2": PASSWORD},
        )
        self.assertRedirects(response, reverse("menu:list"))
        self.assertTrue(User.objects.filter(username="cliente1").exists())
        self.assertIn("_auth_user_id", self.client.session)

    def test_registro_con_contrasenas_distintas_no_crea_usuario(self):
        response = self.client.post(
            reverse("accounts:register"),
            {"username": "cliente1", "password1": PASSWORD, "password2": "Otra#Clave2026"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username="cliente1").exists())

    def test_login_correcto(self):
        User.objects.create_user("cliente1", password=PASSWORD)
        response = self.client.post(
            reverse("accounts:login"), {"username": "cliente1", "password": PASSWORD}
        )
        self.assertRedirects(response, reverse("menu:list"))
        self.assertIn("_auth_user_id", self.client.session)

    def test_login_con_clave_incorrecta(self):
        User.objects.create_user("cliente1", password=PASSWORD)
        response = self.client.post(
            reverse("accounts:login"), {"username": "cliente1", "password": "incorrecta"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_logout_cierra_la_sesion(self):
        user = User.objects.create_user("cliente1", password=PASSWORD)
        self.client.force_login(user)
        response = self.client.post(reverse("accounts:logout"))
        self.assertRedirects(response, reverse("menu:list"))
        self.assertNotIn("_auth_user_id", self.client.session)