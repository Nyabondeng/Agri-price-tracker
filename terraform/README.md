# Terraform Infrastructure as Code (IaC)

This directory contains all Terraform configuration files to provision the complete Azure infrastructure for the Agri Price Tracker application.

## Overview

The Terraform configuration creates a secure, production-ready cloud environment with:

- **Virtual Network (VNet)** with public and private subnets
- **Azure Bastion Host** in the public subnet for secure SSH access
- **Application Virtual Machine** in the private subnet
- **Azure Database for PostgreSQL** in a dedicated database subnet
- **Network Security Groups (NSGs)** with firewall rules
- **Azure Container Registry (ACR)** for private Docker image storage
- **Managed identity and access controls** following security best practices

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Azure VNet                           │
│                    (10.0.0.0/16)                            │
├──────────────────────┬──────────────────┬──────────────────┤
│  Public Subnet       │  Private Subnet  │   DB Subnet      │
│  (10.0.1.0/24)       │  (10.0.2.0/24)   │  (10.0.3.0/24)   │
│                      │                  │                  │
│ ┌────────────────┐  │ ┌──────────────┐ │ ┌──────────────┐ │
│ │ Azure Bastion  │  │ │  App VM      │ │ │   PostgreSQL │ │
│ │ (Public IP)    │◄─┼─┤   (Private)  │ │ │   Database   │ │
│ │ Jump host      │  │ │              │ │ │              │ │
│ └────────────────┘  │ │ Docker       │ │ └──────────────┘ │
│                      │ │ Container    │ │                  │
│                      │ └──────────────┘ │                  │
└──────────────────────┴──────────────────┴──────────────────┘
         │                      │                    │
         │                      │                    │
         v                      v                    v
    Internet      Private Subnet NSG     Database NSG
    (Allow SSH)   (SSH from Bastion,     (PostgreSQL
                   HTTP/HTTPS to app)     from App VM)
```

## File Organization

```
terraform/
├── README.md              # This file
├── provider.tf            # Azure provider and Terraform config
├── main.tf                # All resource definitions
├── variables.tf           # Input variables with defaults
├── outputs.tf             # Output values (critical IPs and URLs)
├── terraform.tfvars       # Variable values (git-ignored if contains secrets)
└── .gitignore             # Terraform state files are git-ignored
```

## Prerequisites

### Software Requirements
- **Terraform** >= 1.0 (install from [terraform.io](https://www.terraform.io/downloads))
- **Azure CLI** (install from [microsoft.com](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))
- **jq** (optional, for parsing JSON outputs)

### Azure Account Prerequisites
- Active Azure subscription
- Service Principal or Azure CLI authentication configured
- Role: Contributor or Owner (to create/manage resources)

### Authentication Setup

**Option 1: Using Azure CLI (Recommended for development)**
```bash
# Login to Azure
az login

# Set default subscription
az account set --subscription <SUBSCRIPTION_ID>

# Verify authentication
az account show
```

**Option 2: Using Environment Variables (For CI/CD)**
The following environment variables set in GitHub Secrets are used in CI/CD:
- `ARM_CLIENT_ID` — Azure Service Principal client ID
- `ARM_CLIENT_SECRET` — Azure Service Principal client secret
- `ARM_SUBSCRIPTION_ID` — Azure subscription ID
- `ARM_TENANT_ID` — Azure tenant ID

## Resource Overview

### 1. Virtual Network (VNet)
- **Name Format**: `vnet-{project_name}-{random_suffix}`
- **Address Space**: 10.0.0.0/16
- **Purpose**: Isolated network for all Azure resources

### 2. Subnets
Three subnets created to separate concerns:

| Subnet | CIDR | Purpose |
|--------|------|---------|
| AzureBastionSubnet | 10.0.1.0/24 | Azure Bastion host (public) |
| Private Subnet | 10.0.2.0/24 | Application VM (private) |
| Database Subnet | 10.0.3.0/24 | PostgreSQL database (private) |

### 3. Azure Bastion Host
- **Name Format**: `bas-{project_name}-{random_suffix}`
- **SKU**: Standard
- **Purpose**: Secure jump host for SSH access to private VM
- **Feature**: Tunneling enabled for CLI-based access
- **Public IP**: Static, assigned for reliable access

### 4. Application Virtual Machine
- **Name Format**: `vm-app-{random_suffix}`
- **Size**: Default `Standard_B2s_v2` (2 vCPU, 4 GB RAM) — customizable via `vm_size` variable
- **Image**: Ubuntu 22.04 LTS (Jammy)
- **Network**: Private subnet (10.0.2.x)
- **Public Access**: Only through Bastion Host (no direct internet access)
- **SSH**: Key-based authentication via Terraform-generated key pair

### 5. Azure Database for PostgreSQL
- **Name Format**: `psql-{project_name}-{random_suffix}`
- **Version**: PostgreSQL 15
- **Tier**: Burstable (`Standard_B1ms`)
- **Network**: Private subnet (10.0.3.x)
- **Public Access**: Disabled (only accessible from private VNet)
- **Credentials**: Admin username and password (stored in Azure Secrets)

### 6. Network Security Groups (NSGs)
Two NSGs control traffic:

**App VM NSG (Public Rules)**:
- Allow SSH (port 22) from Bastion subnet only
- Allow HTTP (port 80) and HTTPS (port 443) from internet
- Allow application traffic (port 3000) from internet
- Deny all other inbound traffic

**Database NSG (Private Rules)**:
- Allow PostgreSQL (port 5432) from App subnet only
- Deny all other inbound traffic

### 7. Azure Container Registry (ACR)
- **Name Format**: `acr{project_name}{random_suffix}` (alphanumeric only)
- **SKU**: Standard (supports geo-replication, webhooks)
- **Admin Access**: Enabled (for CI/CD authentication)
- **Purpose**: Private registry for Docker images

## Getting Started

### Step 1: Set Variables
Customize the Terraform variables for your environment:

```bash
# Copy the example values file (if it exists)
cp terraform.tfvars.example terraform.tfvars

# Or create your own terraform.tfvars with:
cat > terraform.tfvars <<EOF
resource_group_location = "southafricanorth"  # Azure region
project_name            = "agric-price-tracker"
environment             = "production"
db_username             = "postgres_admin"    # Database admin username
db_password             = "SecurePassword123!"  # Database admin password (use strong password!)
vm_size                 = "Standard_B2s_v2"   # VM size (B1s for smaller, B2s for larger)
EOF
```

**Important**: Do NOT commit `terraform.tfvars` to Git if it contains real passwords. Use GitHub Secrets instead (recommended for CI/CD).

### Step 2: Initialize Terraform
```bash
cd terraform

# Download required providers
terraform init
```

**Output**:
```
Terraform has been successfully configured!
```

### Step 3: Validate Configuration
```bash
# Check syntax and logic
terraform validate

# Format code (optional, ensures consistency)
terraform fmt -recursive
```

### Step 4: Plan Deployment
```bash
# Preview all resources that will be created
terraform plan -out=tfplan

# Review the output carefully!
# Look for:
# - Correct number of resources
# - Correct region and naming
# - No unexpected modifications
```

### Step 5: Apply Configuration
```bash
# Create all infrastructure
terraform apply tfplan

# Or directly (if you didn't save a plan):
terraform apply
```

**Expected Duration**: 5-10 minutes

**Output Examples**:
```
Apply complete! Resources: 17 added, 0 changed, 0 destroyed.

Outputs:
bastion_host_ip = "52.123.456.789"
app_vm_private_ip = "10.0.2.4"
acr_login_server = "acragricpricetrickeravloqy.azurecr.io"
database_fqdn = "psql-agric-price-tracker-abcde.postgres.database.azure.com"
```

## Important Outputs

After `terraform apply`, save these values securely:

```bash
# Display output values
terraform output

# Or get specific values
terraform output -json
```

**Critical Outputs**:
- `bastion_host_ip` — Use to SSH into private VM (required for Ansible)
- `app_vm_private_ip` — Private IP of app VM (required for Ansible inventory)
- `acr_login_server` — ACR registry URL (required for Docker push/pull)
- `database_fqdn` — PostgreSQL connection endpoint

## SSH Key Management

Terraform automatically generates an RSA 4096-bit SSH key pair for VM access:

```bash
# The private key is saved locally:
cat ssh-key-agric-price-tracker.pem

# Verify permissions (must be 0600)
ls -la ssh-key-agric-price-tracker.pem

# Connect to private VM through Bastion:
ssh -i ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i ssh-key-agric-price-tracker.pem -W %h:%p azureuser@<BASTION_IP>" \
    azureuser@<APP_VM_PRIVATE_IP>
```

**Security**: This private key grants full access to your VM. Never commit it to Git.

## Managing Terraform State

Terraform state files (`terraform.tfstate*`) are **automatically git-ignored** in `.gitignore`.

Local state is fine for development, but for production:

### Remote State Backend (Recommended for Teams)
Configure HCP Terraform (formerly Terraform Cloud) for remote state:

```bash
# Create HCP Terraform token at: https://app.terraform.io

# Authenticate:
terraform login

# Add to terraform block in provider.tf:
terraform {
  cloud {
    organization = "your-org-name"
    workspaces {
      name = "agri-price-tracker"
    }
  }
}

# Reinitialize:
terraform init
```

## Modifying Infrastructure

### Change VM Size
```bash
# Edit terraform.tfvars:
vm_size = "Standard_B4ms"

# Apply:
terraform plan
terraform apply
```

### Modify Network Configuration
```bash
# Update in variables.tf defaults or terraform.tfvars
vnet_address_space = ["10.0.0.0/16"]
public_subnet_prefix = "10.0.1.0/24"

# Plan first to see impacts:
terraform plan
```

### Add More NSG Rules
Edit `main.tf` to add additional security rules to NSGs. Example:

```hcl
security_rule {
  name                       = "AllowCustomPort"
  priority                   = 120
  direction                  = "Inbound"
  access                     = "Allow"
  protocol                   = "Tcp"
  source_port_range          = "*"
  destination_port_range     = "8080"
  source_address_prefix      = "0.0.0.0/0"
  destination_address_prefix = "*"
}
```

## Destroying Infrastructure

When you're done developing/testing, **remove all resources to avoid charges**:

```bash
# Destroy only specific resources (prompt for confirmation)
terraform destroy

# Auto-approve destruction (use with caution!)
terraform destroy -auto-approve
```

**Important**: This destroys ALL resources including:
- Virtual Machines
- Databases (data is lost)
- Networks
- Container Registry images

## Troubleshooting

### Issue: `Provider not found`
```
Error: Could not satisfy plugin requirements
```
**Solution**:
```bash
rm -rf .terraform
terraform init
```

### Issue: `Authentication failed`
```
Error: Error building AzureRM Client: ... using Azure CLI authorization failed
```
**Solution**:
```bash
az login
az account set --subscription <SUBSCRIPTION_ID>
```

### Issue: `Resource already exists`
```
Error: A resource with the ID already exists
```
**Solution**: Ensure you're using unique `project_name` or `resource_group_location`.

### Issue: `Subnet conflict`
```
Error: Invalid CIDR block
```
**Solution**: Ensure CIDR blocks don't overlap:
- VNet: 10.0.0.0/16
- Subnets must be subsets (10.0.1.0/24, 10.0.2.0/24, etc.)

### Issue: `Database creation timeout`
**Solution**: This is normal for PostgreSQL; wait 10+ minutes.

## Security Best Practices

1. **Never commit secrets**: Keep `terraform.tfvars` out of Git if it contains passwords
2. **Use strong database passwords**: Minimum 12 characters, mixed case, numbers, symbols
3. **Restrict SSH access**: Default allows from bastion only; be careful modifying NSG rules
4. **Enable backups**: Azure Database for PostgreSQL has automatic backups enabled by default
5. **Rotate credentials**: Update database and SSH keys periodically
6. **Use service principals**: For CI/CD (never use personal credentials)

## Cost Estimation

**Approximate monthly costs** (as of 2026):

| Resource | Size | Cost |
|----------|------|------|
| Azure Bastion | Standard | ~$45 |
| App VM | B2s_v2 | ~$35 |
| PostgreSQL | B1ms | ~$50 |
| ACR | Standard | ~$5 |
| **Total** | — | **~$135** |

**Cost Optimization**:
- Use `Standard_B1s` for VMs to reduce costs (~$8/month)
- Use `Standard_B1ms` for database (~$20/month)
- Delete resources when not in use

## Next Steps

1. **Run Terraform Apply** to create infrastructure
2. **Save Outputs** securely (Bastion IP, App VM IP, ACR URL)
3. **Configure GitHub Secrets** with Terraform outputs (see [../docs/GITHUB_SECRETS.md](../docs/GITHUB_SECRETS.md))
4. **Run Ansible Playbook** to configure the VM (see [../ansible/README.md](../ansible/README.md))
5. **Deploy Application** via CI/CD pipeline

## References

- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Terraform Examples](https://github.com/Azure-Samples/terraform-examples)
- [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)

## Support

For issues or questions:

1. Check `terraform.log` for detailed error messages:
   ```bash
   TF_LOG=DEBUG terraform apply 2>&1 | tee terraform.log
   ```
2. Review Azure Portal for resource creation status
3. Consult team members or Azure documentation

---

**Last Updated**: 2026-03-31  
**Maintainer**: DevOps Team
