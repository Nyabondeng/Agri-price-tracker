# Cloud-Init Automatic Deployment Guide

## Overview

The **Agri Price Tracker** project now uses **Azure cloud-init** for fully automated deployment. This eliminates the need for:
- ❌ Self-hosted GitHub runners
- ❌ Manual SSH/Ansible deployments
- ❌ Complex networking setup

Everything happens **automatically on VM boot** via cloud-init script.

## How It Works

```
Git Push to main
    ↓
GitHub Actions CI (GitHub-hosted)
    ├─ Lint & Test ✓
    ├─ Security Scans ✓
    └─ Build & Push Docker Image to ACR ✓
    ↓
Terraform Provisions Infrastructure (HCP Terraform)
    ├─ Creates VNet, Subnets, Security Groups
    ├─ Creates App VM with cloud-init script
    ├─ Creates Database, Bastion
    └─ VM boots with custom_data (cloud-init)
    ↓
Cloud-Init Script Runs (on VM boot)
    ├─ Install Docker
    ├─ Install Nginx
    ├─ Install Certbot
    ├─ Pull Docker image from ACR
    ├─ Wait for DNS resolution
    ├─ Request SSL certificate from Let's Encrypt
    ├─ Configure HTTPS with security headers
    ├─ Setup daily certificate renewal
    └─ Start application container
    ↓
✅ Live HTTPS Application (automatic)
```

## Deployment Timeline

| Phase | Duration | What Happens |
|-------|----------|---|
| CI Pipeline | ~3 min | GitHub Actions tests and builds |
| Terraform Apply | ~5 min | Infrastructure created in Azure |
| VM Boot | ~2 min | Instance starts up |
| Cloud-Init Execution | ~5 min | Scripts run, packages installed |
| Container Pull | ~1 min | Docker image downloaded from ACR |
| SSL Certificate | ~3 min | Let's Encrypt verification and setup |
| **Total** | **~19 min** | End to end |

## Setup Process

### Prerequisites

- ✅ GitHub Secrets configured (ACR + Network)
- ✅ HCP Terraform workspace with variables
- ✅ DuckDNS account and domain configured
- ✅ Azure subscription

### Step 1: Deploy Infrastructure via HCP Terraform

1. Go to **https://app.terraform.io/app/Team_404/Agri-price-tracker**
2. Click **New Run**
3. Select **Plan and Apply**
4. Review the 21 resources to be created
5. Click **Confirm & Apply**
6. Wait 5-10 minutes for completion

### Step 2: Push Code to Trigger CI/CD

```bash
cd Agri-price-tracker
git commit --allow-empty -m "Deploy: First automated cloud-init deployment"
git push
```

### Step 3: Monitor GitHub Actions

1. Go to **GitHub → Actions → deploy-production**
2. Watch the workflow:
   - ✓ Build Docker image (~2 min)
   - ✓ Push to ACR (~1 min)
   - ✓ Deployment notification

### Step 4: Wait for Infrastructure & Cloud-Init

- Terraform creates VM with cloud-init script
- VM boots (~2 min)
- Cloud-init runs (~5 min)
- SSL certificate obtained (~3 min)
- **Application live!**

### Step 5: Verify Deployment

After ~15-20 minutes total:

```bash
# Check application is running
curl -I https://agri-price-tracker.duckdns.org/

# SSH to VM to monitor logs
ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@BASTION_IP

# On VM, view deployment logs
tail -f /var/log/agri-price-tracker-deploy.log

# Check container
docker ps
docker logs agric-price-tracker-app
```

## Cloud-Init Script Details

The cloud-init script (`terraform/cloud-init.tpl`) handles all deployment steps:

### Phase 1: System Updates
- Update apt package manager
- Install common utilities

### Phase 2: Docker Installation
- Download Docker repository keys
- Install Docker CE and plugins
- Enable and start Docker service

### Phase 3: Nginx Installation
- Install Nginx web server
- Install Certbot and Nginx plugin
- Enable and start Nginx

### Phase 4: Certbot Setup
- Create validation directories
- Setup certificate renewal script
- Configure daily cron job (3:30 AM)

### Phase 5: Initial Nginx Configuration (HTTP)
- Setup HTTP listener on port 80
- Configure ACME challenge validation path
- Setup reverse proxy to localhost:3000

### Phase 6: Docker Authentication
- Login to Azure Container Registry
- Prepare for image pull

### Phase 7: Deploy Application
- Pull Docker image from ACR
- Stop old container (if exists)
- Run new container with environment variables
- Expose on port 3000

### Phase 8-10: DNS & SSL Setup
- Wait for DuckDNS domain to resolve
- Request certificate from Let's Encrypt
- Configure Nginx for HTTPS
- Add security headers

### Phase 11: Auto-Renewal
- Create renewal script
- Setup daily cron job
- Verify certificate installation

### Phase 12: Summary
- Display deployment status
- Show application URLs
- Provide log locations

## Monitoring Deployment

### From GitHub Actions
The workflow will show:
```
✓ Docker image built
✓ Image pushed to ACR
✓ Cloud-init deployment will run on VM boot
```

### On the VM (after SSH)
```bash
# View real-time deployment logs
sudo tail -f /var/log/agri-price-tracker-deploy.log

# Check specific phases
grep "Phase" /var/log/agri-price-tracker-deploy.log

# Monitor Docker
docker ps -a
docker logs agric-price-tracker-app -f

# Check Nginx
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/access.log

# Verify SSL
curl -I https://agri-price-tracker.duckdns.org/
openssl s_client -connect agri-price-tracker.duckdns.org:443 </dev/null | openssl x509 -noout -dates
```

## Environment Variables Passed to Cloud-Init

The Terraform configuration passes these to cloud-init:

| Variable | Value | Source |
|---|---|---|
| `docker_image` | ACR full URL | Terraform variable `docker_image_url` |
| `acr_login_server` | ACR hostname | Terraform output |
| `acr_username` | ACR admin username | Terraform output |
| `acr_password` | ACR admin password | Terraform output |
| `domain_name` | agri-price-tracker.duckdns.org | Terraform variable |
| `cert_email` | admin@agri-price-tracker.duckdns.org | Terraform variable |

## Updating Docker Image

When you push new code:

```bash
git add .
git commit -m "Feature: Update application"
git push
```

The workflow will:
1. Build new Docker image
2. Push to ACR as `latest` and with git SHA tag
3. Cloud-init script will pull `latest` on next deployment

To redeploy with the latest image:

```bash
cd terraform
terraform apply -var="docker_image_url=YOUR_ACR.azurecr.io/agri-price-tracker:latest"
```

Or wait for the next infrastructure update.

## Troubleshooting

### "Cloud-init still running" after 15 minutes

Check logs on VM:
```bash
sudo tail -100 /var/log/agri-price-tracker-deploy.log
sudo systemctl status cloud-final

# View cloud-init errors
sudo cat /var/log/cloud-init-output.log
```

### "Certificate request failed"

Causes:
1. DuckDNS domain not resolving to Bastion/App IP
2. Port 80 not accessible from internet
3. DNS not propagated yet

Check DNS:
```bash
nslookup agri-price-tracker.duckdns.org
dig agri-price-tracker.duckdns.org
```

Update DuckDNS if needed.

### "Docker image pull failed"

ACR credentials issue:
```bash
# SSH to VM
docker login YOUR_ACR.azurecr.io

# Check available images
az acr repository list --name YOUR_ACR --output table
```

### "Nginx won't start"

Check configuration:
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo journalctl -xe
```

## Advantages of Cloud-Init Approach

✅ **No Runner Setup** - No self-hosted runner configuration  
✅ **No SSH Complexity** - No jump hosts or bastion tunneling
✅ **Fastest Deployment** - Everything happens on VM boot  
✅ **Simple Updates** - Just push code and Terraform handles it  
✅ **Repeatable** - Destroy and recreate VMs with same deployment  
✅ **Logging** - All logs stored in `/var/log/`  
✅ **Secure** - Credentials handled by Terraform, not hardcoded  
✅ **Scalable** - Clone VM images for horizontal scaling  

## What Happens on Every Push

```bash
git push
  ↓
GitHub Actions Runs:
  1. Lint & Test (~2 min)
  2. Build Docker (~2 min)
  3. Push to ACR (~1 min)
  4. Notify deployment ready (~1 min)
  ↓
Status: Ready for Terraform apply
     (Manual trigger in HCP Terraform)
  ↓
Terraform triggers cloud-init:
  1. VM provisions (~5 min)
  2. Cloud-init runs (~5 min)
  3. SSL obtained (~3 min)
  ↓
✅ Application Updated & Live (13-15 min total)
```

## Files Updated

- `terraform/main.tf` - Added cloud-init integration
- `terraform/cloud-init.tpl` - Deployment automation script
- `terraform/variables.tf` - Added `docker_image_url` variable
- `terraform/terraform.tfvars` - Docker image configuration
- `.github/workflows/cd.yml` - Simplified to build+push only
- `ansible/deploy.yml` - Still available for other uses

## Reverting to Ansible

If needed, the Ansible playbook is still available and can be:
1. Used standalone for post-deployment configuration
2. Called manually from cloud-init if needed
3. Used with self-hosted runners if preferred

Cloud-init approach is recommended for its simplicity.

## Next Steps

1. ✅ Configure HCP Terraform variables
2. ✅ Run Terraform to create infrastructure
3. ✅ Push code to trigger GitHub Actions
4. ✅ Application auto-deploys via cloud-init
5. ✅ Monitor logs during deployment
6. ✅ Verify HTTPS certificate installed

**No manual deployment steps required!** 🚀

---

For detailed cloud-init script see: [terraform/cloud-init.tpl](../terraform/cloud-init.tpl)  
For infrastructure setup see: [terraform/README.md](../terraform/README.md)  
For CI/CD workflow see: [.github/workflows/cd.yml](../.github/workflows/cd.yml)
