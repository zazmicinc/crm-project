output "backend_url" {
  description = "The URL of the backend service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "The URL of the frontend service"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "database_connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.connection_name
}

output "database_private_ip" {
  description = "The private IP of the Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
}

output "artifact_registry_repo_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.crm_repo.repository_id}"
}
