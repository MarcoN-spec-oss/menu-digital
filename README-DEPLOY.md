# Guía de Despliegue en Google Cloud Run

Este documento describe cómo desplegar el backend (Django) y frontend (Vite + React) como servicios separados en Google Cloud Run.

## Requisitos Previos

1. **Google Cloud CLI instalado y autenticado**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Proyecto de Google Cloud creado**
   ```bash
   gcloud projects create TU_PROJECT_ID
   gcloud config set project TU_PROJECT_ID
   ```

3. **APIs habilitadas**
   ```bash
   gcloud services enable run.googleapis.com \
       cloudbuild.googleapis.com \
       sqladmin.googleapis.com \
       artifactregistry.googleapis.com \
       storage.googleapis.com
   ```

4. **Docker instalado localmente** (para builds locales si se desea)

---

## 1. Crear Instancia de Cloud SQL PostgreSQL

```bash
# Crear instancia
gcloud sql instances create mi-instancia \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=TU_PASSWORD_SEGURO

# Crear base de datos
gcloud sql databases create mi_base_datos --instance=mi-instancia

# Crear usuario (opcional, puede usar el root)
gcloud sql users create mi_usuario \
    --instance=mi-instancia \
    --password=TU_PASSWORD_USUARIO
```

**Obtener la conexión para DATABASE_URL:**
```bash
gcloud sql instances describe mi-instancia --format="value(connectionName)"
# Formato: PROYECTO:REGION:INSTANCIA
```

La `DATABASE_URL` para Cloud Run con Cloud SQL Proxy:
```
postgres://mi_usuario:TU_PASSWORD@/mi_base_datos?host=/cloudsql/PROYECTO:REGION:INSTANCIA
```

---

## 2. Crear Bucket de Cloud Storage para Media Files

```bash
# Crear bucket
gsutil mb -l us-central1 gs://mi-bucket-media

# Hacer público (para servir archivos media directamente)
gsutil iam ch allUsers:objectViewer gs://mi-bucket-media

# O configurar CORS si es necesario
cat > cors.json <<EOF
[
  {
    "origin": ["https://*.run.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://mi-bucket-media
```

---

## 3. Configurar Variables de Entorno

### Backend (Back-menu-digital/.env)

Copiar el archivo de ejemplo y completar:
```bash
cp Back-menu-digital/.env.example Back-menu-digital/.env
# Editar Back-menu-digital/.env con tus valores reales
```

Variables requeridas:
- `SECRET_KEY`: Generar con `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DATABASE_URL`: Formato `postgres://user:pass@/dbname?host=/cloudsql/PROYECTO:REGION:INSTANCIA`
- `GS_BUCKET_NAME`: Nombre del bucket creado (ej: `mi-bucket-media`)

### Frontend (frontend/.env)

```bash
cp frontend/.env.example frontend/.env
# Editar frontend/.env con la URL del backend
```

Variable requerida:
- `VITE_API_BASE_URL`: URL del backend desplegado (ej: `https://mi-backend-xyz.a.run.app`)

---

## 4. Configurar deploy.sh

Editar `deploy.sh` y actualizar las variables de configuración:
```bash
PROJECT_ID="tu-project-id"
REGION="us-central1"
BACKEND_SERVICE="mi-backend"
FRONTEND_SERVICE="mi-frontend"
SQL_INSTANCE="mi-instancia"
```

**Importante**: Exportar las variables de entorno antes de ejecutar:
```bash
export SECRET_KEY="tu-secret-key"
export DATABASE_URL="postgres://..."
export GS_BUCKET_NAME="mi-bucket-media"
```

---

## 5. Ejecutar Despliegue

```bash
./deploy.sh
```

El script:
1. Construye y sube la imagen del backend a Container Registry
2. Despliega el backend en Cloud Run con conexión a Cloud SQL
3. Obtiene la URL del backend
4. Construye y sube la imagen del frontend (inyectando la URL del backend)
5. Despliega el frontend en Cloud Run
6. Actualiza los CORS del backend con la URL del frontend

---

## 6. Ejecutar Migraciones (Primer Despliegue)

### Opción A: Cloud Run Job (Recomendado)

```bash
gcloud run jobs create migrate \
    --image gcr.io/TU_PROJECT_ID/mi-backend \
    --region us-central1 \
    --command "python" \
    --args "manage.py,migrate" \
    --set-env-vars "DEBUG=False,SECRET_KEY=$SECRET_KEY,DATABASE_URL=$DATABASE_URL" \
    --add-cloudsql-instances TU_PROJECT_ID:us-central1:mi-instancia

# Ejecutar el job
gcloud run jobs execute migrate --region us-central1 --wait
```

### Opción B: Cloud Shell con Cloud SQL Proxy

```bash
# En Cloud Shell
gcloud sql connect mi-instancia --user=mi_usuario --database=mi_base_datos

# O usar proxy localmente
cloud_sql_proxy -instances=TU_PROJECT_ID:us-central1:mi-instancia=tcp:5432
# Luego en otra terminal:
DATABASE_URL="postgres://mi_usuario:PASS@localhost:5432/mi_base_datos" python manage.py migrate
```

### Opción C: Ejecutar en el contenedor del backend (después del primer deploy)

```bash
gcloud run services update mi-backend --region us-central1 --command "python" --args "manage.py,migrate"
# Esperar a que termine, luego restaurar el comando original:
gcloud run services update mi-backend --region us-central1 --command "gunicorn" --args "config.wsgi:application,--bind,0.0.0.0:8080,--workers,2,--threads,4,--timeout,0"
```

---

## 7. Crear Superusuario (Opcional)

```bash
gcloud run jobs create createsuperuser \
    --image gcr.io/TU_PROJECT_ID/mi-backend \
    --region us-central1 \
    --command "python" \
    --args "manage.py,createsuperuser" \
    --set-env-vars "DEBUG=False,SECRET_KEY=$SECRET_KEY,DATABASE_URL=$DATABASE_URL" \
    --add-cloudsql-instances TU_PROJECT_ID:us-central1:mi-instancia

gcloud run jobs execute createsuperuser --region us-central1 --wait
```

---

## 8. Verificar Despliegue

```bash
# Ver logs del backend
gcloud run services logs read mi-backend --region us-central1 --limit 50

# Ver logs del frontend
gcloud run services logs read mi-frontend --region us-central1 --limit 50

# Verificar salud
curl https://mi-backend-xyz.a.run.app/health
curl https://mi-frontend-xyz.a.run.app/health
```

---

## 9. Actualizar Variables de Entorno Post-Despliegue

Si necesitas cambiar variables sin reconstruir:

```bash
# Backend
gcloud run services update mi-backend \
    --region us-central1 \
    --update-env-vars "CORS_ALLOWED_ORIGINS=https://nuevo-frontend.run.app,CSRF_TRUSTED_ORIGINS=https://nuevo-frontend.run.app"

# Frontend (requiere rebuild con nueva VITE_API_BASE_URL)
cd frontend
gcloud builds submit --tag gcr.io/TU_PROJECT_ID/mi-frontend \
    --substitutions=_VITE_API_BASE_URL=https://nuevo-backend.run.app \
    --config=cloudbuild.yaml
cd ..
gcloud run services update mi-frontend --region us-central1 --image gcr.io/TU_PROJECT_ID/mi-frontend
```

---

## Estructura de Archivos Creados

```
├── Back-menu-digital/
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── .dockerignore           # Archivos ignorados en build
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── requirements.txt        # Dependencias Python actualizadas
│   └── config/
│       └── settings.py         # Configuración Django para producción
├── frontend/
│   ├── Dockerfile              # Multi-stage build con Nginx
│   ├── nginx.conf              # Configuración Nginx
│   ├── .dockerignore           # Archivos ignorados en build
│   ├── .env.example            # Plantilla de variables de entorno
│   └── cloudbuild.yaml         # Build config para Cloud Build
├── deploy.sh                   # Script de despliegue automatizado
└── README-DEPLOY.md            # Esta guía
```

---

## Solución de Problemas Comunes

### Error: "relation does not exist"
Ejecutar migraciones (ver sección 6).

### Error: CORS bloqueado
Verificar que `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` incluyan la URL exacta del frontend (con `https://`).

### Error: Archivos media no se sirven
Verificar que `GS_BUCKET_NAME` esté configurado y el bucket tenga permisos públicos.

### Error: Static files 404
Verificar que `collectstatic` se ejecutó en el Dockerfile (la línea `RUN python manage.py collectstatic --noinput || true`).

### Cloud SQL Connection Failed
Verificar:
- `--add-cloudsql-instances` tiene el connection name correcto
- `DATABASE_URL` usa `host=/cloudsql/PROYECTO:REGION:INSTANCIA`
- La instancia SQL permite conexiones públicas o está en la misma VPC

---

## Notas de Seguridad

- **NUNCA** commitear archivos `.env` reales al repositorio
- Usar Secret Manager para variables sensibles en producción
- Rotar `SECRET_KEY` y contraseñas de BD periódicamente
- Configurar `SECURE_HSTS_SECONDS` a 31536000 (1 año) tras verificar que HTTPS funciona
- Revisar `ALLOWED_HOSTS` - usar dominios específicos, no `*` en producción