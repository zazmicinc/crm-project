variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The environment environment"
  type        = string
  default     = "production"
}

variable "db_tier" {
  description = "The Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-4096"
}

variable "db_name" {
  description = "The database name"
  type        = string
  default     = "crm_production"
}

variable "db_user" {
  description = "The database user"
  type        = string
  default     = "crm_user"
}

variable "backend_image" {
  description = "The backend container image"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "frontend_image" {
  description = "The frontend container image"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "backend_min_instances" {
  type    = number
  default = 0
}

variable "backend_max_instances" {
  type    = number
  default = 10
}

variable "frontend_min_instances" {
  type    = number
  default = 0
}

variable "frontend_max_instances" {
  type    = number
  default = 5
}
