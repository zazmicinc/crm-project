# Zazmic CRM — DevOps (Agent 7)

GCP infrastructure provisioning and deployment for the Zazmic CRM application.

## Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5.0
- [Docker](https://docs.docker.com/get-docker/) installed and running
- A GCP project with billing enabled

## Quick Start

### First time — set up production:
```
/setup-prod
```
or say: "Set up the production environment on GCP"

### Deploy code:
```
/deploy
```
or say: "Deploy to production"

### Rollback:
```
/rollback
```
or say: "Rollback the backend to the previous version"

## Architecture

```
                    ┌──────────────┐
                    │   Users      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Cloud Run   │
                    │  (Frontend)  │
                    │  React/Nginx │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Cloud Run   │
                    │  (Backend)   │
                    │  FastAPI     │
                    └──────┬───────┘
                           │ VPC Connector
                    ┌──────▼───────┐
                    │  Cloud SQL   │
                    │  PostgreSQL  │
                    │  (Private)   │
                    └──────────────┘
```

## File Structure

```
crm-devops/
├── .agent/skills/
│   ├── gcp-infra/SKILL.md      → Infrastructure provisioning
│   └── gcp-deploy/SKILL.md     → Code deployment
├── terraform/                   → Generated Terraform configs
├── dockerfiles/                 → Dockerfile templates
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── scripts/                     → Utility scripts
└── README.md
```

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/setup-prod` | Build GCP infrastructure with Terraform |
| `/deploy` | Build, push, and deploy to Cloud Run |
| `/rollback` | Roll back to a previous Cloud Run revision |
