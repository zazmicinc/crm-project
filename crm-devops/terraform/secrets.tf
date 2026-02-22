resource "google_secret_manager_secret" "db_password" {
  secret_id = "crm-db-password-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "db_url" {
  secret_id = "crm-db-url-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_url" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = "postgresql+psycopg2://${var.db_user}:${random_password.db_password.result}@${google_sql_database_instance.main.private_ip_address}/${var.db_name}"
}

# Allow Cloud Run service account to access secrets
resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_service_account" "cloudrun_sa" {
  account_id   = "crm-cloudrun-sa"
  display_name = "CRM Cloud Run Service Account"
}
