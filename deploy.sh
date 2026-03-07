#!/bin/bash

# Zazmic CRM Manual Deployment Script
# Usage: ./deploy.sh [backend|frontend|both]

set -e  # Exit on error

PROJECT_ID="zazmic-crm"
REGION="us-central1"
SQL_CONNECTION="zazmic-crm:us-central1:crm-db-production"
BACKEND_URL="https://crm-backend-7bx7xdmoeq-uc.a.run.app"

deploy_backend() {
    echo "🚀 Deploying Backend to Cloud Run..."
    
    cd crm-backend
    
    gcloud run deploy crm-backend \
        --source . \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated \
        --set-secrets DATABASE_URL=crm-database-url:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest,GOOGLE_REDIRECT_URI=google-redirect-uri:latest \
        --add-cloudsql-instances $SQL_CONNECTION
    
    echo "✅ Backend deployed successfully!"
    cd ..
}

deploy_frontend() {
    echo "🚀 Deploying Frontend to Cloud Run..."
    
    cd crm-frontend
    
    gcloud run deploy crm-frontend \
        --source . \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated \
        --set-env-vars REACT_APP_API_URL="$BACKEND_URL"
    
    echo "✅ Frontend deployed successfully!"
    cd ..
}

case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    both)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "Usage: ./deploy.sh [backend|frontend|both]"
        exit 1
        ;;
esac
