from pathlib import Path

import qrcode
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Genera un código QR (PNG) por cada mesa del restaurante."

    def add_arguments(self, parser):
        parser.add_argument(
            "--mesas", type=int, required=True,
            help="Cantidad de mesas. Genera de la 1 a la N.",
        )
        parser.add_argument(
            "--url", type=str, required=True,
            help="URL base del sitio, por ejemplo http://192.168.1.15:8000",
        )
        parser.add_argument(
            "--salida", type=str, default="qrs",
            help="Carpeta donde se guardan los PNG (por defecto: qrs).",
        )

    def handle(self, *args, **options):
        mesas = options["mesas"]
        if not 1 <= mesas <= 99:
            raise CommandError("--mesas debe estar entre 1 y 99.")

        base_url = options["url"].rstrip("/")
        if not base_url.startswith(("http://", "https://")):
            raise CommandError("--url debe empezar con http:// o https://")

        out_dir = Path(settings.BASE_DIR) / options["salida"]
        out_dir.mkdir(parents=True, exist_ok=True)

        for numero in range(1, mesas + 1):
            url = f"{base_url}/?mesa={numero}"
            imagen = qrcode.make(url, box_size=10, border=4)
            archivo = out_dir / f"mesa_{numero:02d}.png"
            imagen.save(str(archivo))
            self.stdout.write(f"Mesa {numero}: {url} -> {archivo.name}")

        self.stdout.write(
            self.style.SUCCESS(f"Listo: {mesas} códigos QR guardados en {out_dir}")
        )