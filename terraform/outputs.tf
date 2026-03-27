output "bastion_host_ip" {
  description = "Public IP of Bastion host"
  value       = azurerm_public_ip.bastion.ip_address
}

output "app_vm_private_ip" {
  description = "Private IP of application VM"
  value       = azurerm_linux_virtual_machine.app.private_ip_address
}

output "acr_login_server" {
  description = "ACR login server URL"
  value       = azurerm_container_registry.main.login_server
}

output "database_fqdn" {
  description = "Database connection string"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "app_service_url" {
  description = "Public URL of the App Service (live website)"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "app_service_name" {
  description = "Name of the App Service"
  value       = azurerm_linux_web_app.main.name
}
