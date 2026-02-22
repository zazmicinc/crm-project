---
name: gcp-deploy
description: >
  Use this when the user asks to deploy code to production on GCP.
  Builds Docker images from GitHub, pushes to Artifact Registry,
  and deploys to Cloud Run.
---

# GCP Deployment Manager

## Use this skill when
- User asks to "deploy to production" or "deploy to GCP"
- User asks to "update production" or "release"
- User asks to "rollback" a deployment
- User asks about deployment status or history

## Do not use this skill when
- User wants to set up infrastructure (use gcp-infra skill)
- User is asking about local development

## Tech Stack Context
- **Backend**: Python FastAPI → Cloud Run
- **Frontend**: React TypeScript → Cloud Run (Nginx container)
- **Registry**: GCP Artifact Registry (crm-repo)
- **GitHub**: Source of truth for all code

## Instructions

### When user asks to DEPLOY:

1. Ask what to deploy:
   - Backend only
   - Frontend only
   - Both (full deployment)

2. Verify current state:
   ```
   gcloud config get-value project
   gcloud run services list --region REGION
   gcloud artifacts repositories list --location REGION
   ```

3. Pull latest from GitHub:
   ```
   cd PROJECT_ROOT
   git pull origin main
   ```

4. Generate a version tag based on date and short commit hash:
   ```
   VERSION=$(date +%Y%m%d)-$(git rev-parse --short HEAD)
   ```

5. For BACKEND deployment:

   a. Create/verify `crm-backend/Dockerfile`:
      ```dockerfile
      FROM python:3.11-slim
      WORKDIR /app
      COPY requirements.txt .
      RUN pip install --no-cache-dir -r requirements.txt
      COPY . .
      EXPOSE 8000
      CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
      ```

   b. Build and push:
      ```
      cd crm-backend
      docker build -t REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-backend:$VERSION .
      docker build -t REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-backend:latest .
      docker push REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-backend:$VERSION
      docker push REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-backend:latest
      ```

   c. Run database migrations BEFORE deploying:
      Verify migrations are up to date with production schema.

   d. Deploy to Cloud Run:
      ```
      gcloud run deploy crm-backend \
        --image REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-backend:$VERSION \
        --region REGION \
        --platform managed
      ```

6. For FRONTEND deployment:

   a. Create/verify `crm-frontend/Dockerfile`:
      ```dockerfile
      FROM node:18-alpine AS build
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci
      COPY . .
      ARG VITE_API_URL
      ENV VITE_API_URL=$VITE_API_URL
      RUN npm run build

      FROM nginx:alpine
      COPY --from=build /app/dist /usr/share/nginx/html
      COPY nginx.conf /etc/nginx/conf.d/default.conf
      EXPOSE 8080
      CMD ["nginx", "-g", "daemon off;"]
      ```

   b. Create/verify `crm-frontend/nginx.conf`:
      ```nginx
      server {
          listen 8080;
          root /usr/share/nginx/html;
          index index.html;
          location / {
              try_files $uri $uri/ /index.html;
          }
      }
      ```

   c. Build with backend URL injected:
      ```
      BACKEND_URL=$(gcloud run services describe crm-backend --region REGION --format="value(status.url)")
      cd crm-frontend
      docker build \
        --build-arg VITE_API_URL=$BACKEND_URL \
        -t REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-frontend:$VERSION .
      docker push REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-frontend:$VERSION
      ```

   d. Deploy to Cloud Run:
      ```
      gcloud run deploy crm-frontend \
        --image REGION-docker.pkg.dev/PROJECT_ID/crm-repo/crm-frontend:$VERSION \
        --region REGION \
        --platform managed
      ```

7. After deployment, verify:
   ```
   BACKEND_URL=$(gcloud run services describe crm-backend --region REGION --format="value(status.url)")
   FRONTEND_URL=$(gcloud run services describe crm-frontend --region REGION --format="value(status.url)")
   echo "Backend:  $BACKEND_URL"
   echo "Frontend: $FRONTEND_URL"
   ```
   Open the frontend URL in the browser to verify it works.

8. Present deployment summary:
   - Version deployed
   - Backend URL
   - Frontend URL
   - Deployment timestamp

### When user asks to ROLLBACK:

1. List recent revisions:
   ```
   gcloud run revisions list --service SERVICE_NAME --region REGION --limit 10
   ```

2. Show the revisions with their dates and tags

3. Ask user which revision to roll back to

4. Route 100% traffic to the selected revision:
   ```
   gcloud run services update-traffic SERVICE_NAME \
     --to-revisions=REVISION_NAME=100 \
     --region REGION
   ```

5. Verify the rollback by checking the service URL

### When user asks for DEPLOYMENT STATUS:

1. Show current revisions and traffic split:
   ```
   gcloud run services describe SERVICE_NAME --region REGION
   ```

2. Show recent deployment history:
   ```
   gcloud run revisions list --service SERVICE_NAME --region REGION --limit 5
   ```

## Safety
- ALWAYS confirm which service and environment before deploying
- ALWAYS show the image tag and version before deploying
- ALWAYS run database migrations BEFORE deploying new backend code
- ALWAYS deploy backend before frontend (frontend depends on backend URL)
- NEVER deploy directly from local code without building and pushing first
- Tag all images with both version AND latest
- Show deployment URLs after completion for verification
- Keep at least 3 previous revisions available for rollback
