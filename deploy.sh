#!/bin/bash
set -e

# ====== CONFIGURACIÓN ======
PROJECT_ID="tu-project-id"
REGION="us-central1"
BACKEND_SERVICE="mi-backend"
FRONTEND_SERVICE="mi-frontend"
SQL_INSTANCE="mi-instancia"  # Solo el nombre, no la ruta completa
ARTIFACT_REGISTRY="mi-repo"

# ====== COLORES ======
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}>>> Configurando gcloud...${NC}"
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}>>> Construyendo y subiendo backend...${NC}"
cd Back-menu-digital
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
cd ..

echo -e "${YELLOW}>>> Desplegando backend en Cloud Run...${NC}"
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$SQL_INSTANCE \
    --set-env-vars "DEBUG=False,SECRET_KEY=$SECRET_KEY,ALLOWED_HOSTS=.run.app,DATABASE_URL=$DATABASE_URL,GS_BUCKET_NAME=$GS_BUCKET_NAME" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Backend desplegado en: $BACKEND_URL${NC}"

echo -e "${YELLOW}>>> Construyendo y subiendo frontend...${NC}"
cd frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --substitutions=_VITE_API_BASE_URL=$BACKEND_URL \
    --config=cloudbuild.yaml
cd ..

echo -e "${YELLOW}>>> Desplegando frontend en Cloud Run...${NC}"
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Frontend desplegado en: $FRONTEND_URL${NC}"

echo -e "${YELLOW}>>> Actualizando CORS del backend...${NC}"
gcloud run services update $BACKEND_SERVICE \
    --region $REGION \
    --update-env-vars "CORS_ALLOWED_ORIGINS=$FRONTEND_URL,CSRF_TRUSTED_ORIGINS=$FRONTEND_URL"

echo -e "${GREEN}✅ Despliegue completado${NC}"
echo -e "Backend:  $BACKEND_URL"
echo -e "Frontend: $FRONTEND_URL"