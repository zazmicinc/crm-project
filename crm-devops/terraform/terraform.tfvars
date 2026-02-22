project_id = "zazmic-crm"
region     = "us-central1"
environment = "production"

db_tier = "db-custom-2-4096"
db_name = "crm_production"
db_user = "crm_user"

# Replace with actual image URLs after first build
# backend_image = "us-central1-docker.pkg.dev/zazmic-crm/crm-repo/backend:latest"
# frontend_image = "us-central1-docker.pkg.dev/zazmic-crm/crm-repo/frontend:latest"

backend_min_instances = 0
backend_max_instances = 10

frontend_min_instances = 0
frontend_max_instances = 5
