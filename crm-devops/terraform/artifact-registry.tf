resource "google_artifact_registry_repository" "crm_repo" {
  location      = var.region
  repository_id = "crm-repo"
  description   = "Docker repository for CRM application"
  format        = "DOCKER"
}
