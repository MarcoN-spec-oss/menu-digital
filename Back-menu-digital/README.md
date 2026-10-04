# Menú Digital con QR

Aplicación web para restaurantes: los clientes escanean un código QR en su mesa, ven el menú, arman su pedido y pueden hacer reservaciones. El personal gestiona pedidos y reservas desde un panel.

## Funcionalidades

- Menú por categorías, con búsqueda por nombre o descripción.
- QR por mesa (`/?mesa=5`): la mesa se guarda en la sesión y se usa al confirmar el pedido.
- Carrito en sesión (funciona para invitados y usuarios registrados) con contador dinámico.
- Pedidos con precio congelado al momento de la compra.
- Panel de cocina para el personal (`/pedidos/cocina/`).
- Reservaciones con validación de fecha y gestión de estados (Pendiente, Confirmada, Cancelada).
- Registro e inicio de sesión; historial de pedidos y reservas del cliente.
- Roles de personal: Cocina y Meseros (grupos de Django).

## Tecnologías

Python 3.13, Django 5.2, SQLite (desarrollo) / PostgreSQL (producción), Bootstrap 5, JavaScript, WhiteNoise, Gunicorn.

## Instalación local (Windows)

```bat
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_menu
python manage.py setup_roles
python manage.py runserver
```

Edita `.env` y coloca una `SECRET_KEY` propia. En Linux/macOS usa `source venv/bin/activate` y `cp .env.example .env`.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `python manage.py seed_menu` | Carga categorías y platillos de ejemplo |
| `python manage.py setup_roles` | Crea los grupos Cocina y Meseros |
| `python manage.py generate_qrs --mesas 20 --url https://tu-dominio` | Genera un QR (PNG) por mesa en la carpeta `qrs/` |
| `python manage.py test` | Ejecuta las pruebas automáticas |

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Menú (acepta `?mesa=N`, `?categoria=slug`, `?q=texto`) |
| `/pedidos/carrito/` | Carrito |
| `/pedidos/cocina/` | Panel de cocina (solo personal) |
| `/reservas/` | Formulario de reservas |
| `/reservas/gestion/` | Gestión de reservas (solo personal) |
| `/cuenta/login/`, `/cuenta/registro/` | Autenticación |
| `/admin/` | Administración de Django |

## Estructura

```
config/         Configuración del proyecto
menu/           Categorías y platillos
orders/         Carrito, pedidos y panel de cocina
reservations/   Reservaciones
accounts/       Registro e inicio de sesión
templates/      Plantillas HTML
static/         CSS y JS
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DEBUG` | `True` en desarrollo, `False` en producción |
| `SECRET_KEY` | Clave secreta de Django (obligatoria en producción) |
| `ALLOWED_HOSTS` | Dominios permitidos, separados por coma |
| `CSRF_TRUSTED_ORIGINS` | URLs con `https://` del sitio desplegado |
| `DATABASE_URL` | URL de PostgreSQL (si está vacía se usa SQLite) |

## Trabajo en equipo

- **Backend**: `models.py`, `views.py`, `urls.py`, `forms.py` y `orders/cart.py`.
- **Frontend**: `templates/` y `static/`.
- Nombres de URL y variables de contexto disponibles en las plantillas: ver `config/urls.py` y las vistas de cada app.