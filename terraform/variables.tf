# terraform/variables.tf
variable "resource_group_location" {
 description = "Azure region for resources"
 type        = string
 default     = "southafricanorth"
}


variable "project_name" {
 description = "Project name for resource naming"
 type        = string
 default     = "agric-price-tracker"
}


variable "environment" {
 description = "Environment name"
 type        = string
 default     = "production"
}


variable "vnet_address_space" {
 description = "Address space for Virtual Network"
 type        = list(string)
 default     = ["10.0.0.0/16"]
}


variable "public_subnet_prefix" {
 description = "CIDR for public subnet (Bastion)"
 type        = string
 default     = "10.0.1.0/24"
}


variable "private_subnet_prefix" {
 description = "CIDR for private subnet (App VM)"
 type        = string
 default     = "10.0.2.0/24"
}


variable "db_subnet_prefix" {
 description = "CIDR for database subnet"
 type        = string
 default     = "10.0.3.0/24"
}


variable "vm_size" {
 description = "VM size for application (B1s is free tier eligible)"
 type        = string
 default     = "Standard_B2s_v2"
}


variable "db_username" {
 description = "Database administrator username"
 type        = string
 sensitive   = true
}


variable "db_password" {
 description = "Database administrator password"
 type        = string
 sensitive   = true
}


variable "admin_ssh_public_key" {
 description = "SSH public key for VM access (optional, auto-generated if not provided)"
 type        = string
 default     = ""
}


variable "ssh_public_key" {
 description = "Alias for admin_ssh_public_key (for HCP Terraform compatibility)"
 type        = string
 default     = ""
}


variable "docker_image_url" {
 description = "Full Docker image URL to deploy (e.g., myacr.azurecr.io/agri-price-tracker:latest)"
 type        = string
 default     = ""
 # This will be provided by GitHub Actions after building and pushing the image
}


variable "domain_name" {
 description = "Full DuckDNS domain for the application (e.g. agri-price-tracker.duckdns.org)"
 type        = string
 default     = "agri-price-tracker.duckdns.org"
}


variable "cert_email" {
 description = "Email address for Let's Encrypt certificate notifications"
 type        = string
 default     = "admin@agri-price-tracker.duckdns.org"
}


variable "jwt_secret" {
 description = "JWT secret key for signing authentication tokens"
 type        = string
 sensitive   = true
 default     = ""
}


variable "duckdns_token" {
 description = "DuckDNS token for automatic DNS updates on VM boot"
 type        = string
 sensitive   = true
 default     = ""
}


variable "tags" {
 description = "Tags to apply to all resources"
 type        = map(string)
 default = {
   Environment = "production"
   Project     = "agric-price-tracker"
   ManagedBy   = "Terraform"
 }
}



