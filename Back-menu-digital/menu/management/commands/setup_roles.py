from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

# rol: [(app, modelo, [acciones]), ...]
ROLES = {
    "Cocina": [
        ("orders", "order", ["view", "change"]),
        ("orders", "orderitem", ["view"]),
        ("menu", "dish", ["view", "change"]),  # para marcar platos agotados
    ],
    "Meseros": [
        ("orders", "order", ["view", "add", "change"]),
        ("orders", "orderitem", ["view", "add", "change"]),
        ("menu", "category", ["view"]),
        ("menu", "dish", ["view"]),
        ("reservations", "reservation", ["view", "add", "change"]),
    ],
}


class Command(BaseCommand):
    help = "Crea los grupos Cocina y Meseros con sus permisos (se puede repetir sin problema)."

    def handle(self, *args, **options):
        for role, rules in ROLES.items():
            group, _ = Group.objects.get_or_create(name=role)
            permissions = []
            for app_label, model, actions in rules:
                for action in actions:
                    permissions.append(
                        Permission.objects.get(
                            content_type__app_label=app_label,
                            codename=f"{action}_{model}",
                        )
                    )
            group.permissions.set(permissions)
            self.stdout.write(self.style.SUCCESS(f"{role}: {len(permissions)} permisos asignados"))