---
name: gcp-infra
description: >
  Use this when the user asks to set up, build, or modify the GCP
  production environment. Generates Terraform configs for Cloud Run,
  Cloud SQL, VPC, and related infrastructure.
---

# GCP Infrastructure Provisioner

## Use this skill when
- User asks to "set up production" or "build the environment"
- User asks to "create GCP infrastructure"
- User asks to modify cloud resources or scaling
- User asks about infrastructure costs or status

## Do not use this skill when
- User is asking about local development setup
- User wants to deploy code (use gcp-deploy skill instead)

## Tech Stack Context
This is for the Zazmic CRM application:
- **Backend**: Python FastAPI → deploy to Cloud Run
- **Frontend**: React TypeScript → deploy to Cloud Run (Nginx container)
- **Database**: PostgreSQL → Cloud SQL for PostgreSQL
- **Container Registry**: GCP Artifact Registry
- **GitHub repo**: source of truth for all code

## Instructions

### When user asks to BUILD the production environment:

1. Verify prerequisites by running:
   ```
   gcloud --version
   terraform --version
   docker --version
   gcloud config get-value project
   gcloud auth list
   ```

2. Ask the user for:
   - GCP Project ID (if not already set)
   - Preferred region (default: us-central1)
   - Environment name (default: production)
   - Cloud SQL instance tier (default: db-f1-micro for dev, db-custom-2-4096 for prod)

3. Enable required GCP APIs:
   ```
   gcloud services enable \
     run.googleapis.com \
     sqladmin.googleapis.com \
     artifactregistry.googleapis.com \
     vpcaccess.googleapis.com \
     compute.googleapis.com \
     cloudbuild.googleapis.com \
     secretmanager.googleapis.com \
     servicenetworking.googleapis.com
   ```

4. Generate Terraform configuration files in `terraform/` directory:

   **terraform/versions.tf** — Provider versions:
   ```hcl
   terraform {
     required_version = ">= 1.5.0"
     required_providers {
       google = {
         source  = "hashicorp/google"
         version = "~> 5.0"
       }
     }
     backend "gcs" {
       bucket = "zazmic-crm-tfstate"
       prefix = "terraform/state"
     }
   }
   ```

   **terraform/main.tf** — Provider config:
   ```hcl
   provider "google" {
     project = var.project_id
     region  = var.region
   }
   ```

   **terraform/variables.tf** — All configurable variables:
   - project_id, region, environment
   - db_tier, db_name, db_user
   - backend_image, frontend_image
   - min_instances, max_instances, memory, cpu

   **terraform/vpc.tf** — Networking:
   - VPC network
   - Private subnet for Cloud SQL
   - Private service connection for Cloud SQL
   - Serverless VPC Access connector for Cloud Run

   **terraform/artifact-registry.tf** — Container registry:
   - Artifact Registry Docker repository named "crm-repo"

   **terraform/cloudsql.tf** — Database:
   - Cloud SQL PostgreSQL 16 instance with private IP
   - No public IP access
   - Automated daily backups
   - Database creation (crm_production)
   - User creation with generated password stored in Secret Manager

   **terraform/secrets.tf** — Secret Manager:
   - Database password
   - Database connection URL

   **terraform/cloudrun-backend.tf** — Backend service:
   - Cloud Run service "crm-backend"
   - Connected to VPC connector for Cloud SQL access
   - Environment variables: DATABASE_URL from Secret Manager
   - Min 0 / Max 10 instances (configurable)
   - 512MB memory, 1 vCPU
   - Health check endpoint: /docs
   - Allow unauthenticated access

   **terraform/cloudrun-frontend.tf** — Frontend service:
   - Cloud Run service "crm-frontend"
   - Environment variable: VITE_API_URL pointing to backend URL
   - Min 0 / Max 5 instances
   - 256MB memory, 1 vCPU
   - Allow unauthenticated access

   **terraform/outputs.tf** — Output values:
   - Backend URL
   - Frontend URL
   - Cloud SQL connection name
   - Artifact Registry repository URL

   **terraform/terraform.tfvars.example** — Example variable values

5. Create the Terraform state bucket:
   ```
   gsutil mb -l REGION gs://zazmic-crm-tfstate
   gsutil versioning set on gs://zazmic-crm-tfstate
   ```

6. Run Terraform:
   ```
   cd terraform
   terraform init
   terraform plan -out=tfplan
   ```
   Show the plan to the user and WAIT for explicit approval.

7. After user approves:
   ```
   terraform apply tfplan
   ```

8. Save output values and present a summary including:
   - All service URLs
   - Cloud SQL connection details
   - Artifact Registry repo path
   - Estimated monthly cost

### When user asks to CHECK infrastructure status:
1. Run `terraform output` to show current resources
2. Run `gcloud run services list` to show Cloud Run services
3. Run `gcloud sql instances list` to show databases
4. Present a clear status summary

### When user asks to DESTROY infrastructure:
1. Show what will be destroyed with `terraform plan -destroy`
2. REQUIRE explicit user confirmation with the phrase "yes, destroy"
3. Only then run `terraform destroy`

## Safety
- ALWAYS show terraform plan output and wait for user approval
- NEVER apply infrastructure changes without explicit user confirmation
- NEVER hardcode secrets — use Secret Manager
- NEVER expose Cloud SQL to public internet — always use private IP
- ALWAYS use VPC connector for Cloud Run to Cloud SQL
- Show estimated cost before applying
- NEVER run terraform destroy without double confirmation
