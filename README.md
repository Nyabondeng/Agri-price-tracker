# Agri Price Tracker Ghana

**Helping Ghanaian farmers, traders, and households make better crop pricing decisions with simple, timely market data.**

## Live Application

- **Development**: `http://localhost:3000/`
- **Production**: `https://agri-price-tracker.duckdns.org/` (fully automated deployment)
- **API Endpoint**: `/api/prices` (JSON format)

## Problem Statement & Impact

**Challenge**: Ghana faces rising food prices and agricultural commodity instability. Smallholder farmers, market traders, and urban households lack timely, comparable price information for staples, leading to:
- Poor selling decisions (lost revenue for farmers)
- Inefficient purchasing (extra costs for traders)
- Budget uncertainty (hardship for households)

**Solution**: Agri Price Tracker provides:
- Real-time commodity prices across Ghanaian markets
- Simple, accessible interface (no technical expertise needed)
- Machine-readable API for integration
- Foundation for future alerts and trend analysis

**Target Users**:
- Smallholder farmers (6+ million in Ghana)
- Market traders and aggregators
- Urban/peri-urban households tracking staple prices

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Application** | Node.js 22, Express.js | Backend API and web server |
| **Frontend** | React 18, Vite, Tailwind CSS | Modern UI with hot reload |
| **Database** | PostgreSQL 15 | Persistent data storage |
| **Containerization** | Docker, Docker Compose | Reproducible deployments |
| **Infrastructure** | Terraform 1.6+ | Infrastructure as Code (Azure) |
| **Deployment** | Cloud-init | Automated VM provisioning |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Registry** | Azure Container Registry (ACR) | Private image storage |
| **Domain** | DuckDNS | Free dynamic DNS service |
| **Cloud** | Microsoft Azure | Production cloud platform |

## Team Roles & Responsibilities

| Team Member | Role | Responsibilities |
|------------|------|-----------------|
| Nyabon Deng Adut | Backend Developer | Server-side API, data models |
| Christelle Usanase | Documentation Lead | README, diagrams, guides |
| Agnes Adepa Berko | DevOps Coordinator | CI/CD, Infrastructure, Deployment |
| Nduka-aku Oluchi Rejoice | Team Lead | Overall direction, coordination |

## Current Features

- [x] Display real-time prices for 6 commodities (Maize, Rice, Cassava, Yam, Tomatoes, Cocoa)
- [x] Show prices across 6 major Ghanaian markets
- [x] JSON API endpoint (`GET /api/prices`)
- [x] Responsive web interface
- [x] Database integration (PostgreSQL)
- [x] Containerized deployment (Docker)
- [x] Production-ready CI/CD pipeline (GitHub Actions)
- [x] Automated infrastructure provisioning (Terraform + Cloud-init)
- [x] Automatic HTTPS with Let's Encrypt SSL certificates
- [x] Zero-manual-step deployment (fully automated)

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB WORKFLOW                            │
│                                                                   │
│  Developer Push → GitHub Actions CI (GitHub-hosted runner)      │
│              ├─ Lint, Test, Security Scans                      │
│              ├─ Build Docker Image                              │
│              ├─ Push to Azure Container Registry                │
│              └─ Notification of ready-to-deploy                 │
│                                                                   │
│  Merge to main → Terraform Triggered (HCP Terraform)            │
│              ├─ Create/Update Infrastructure                    │
│              ├─ Pass Docker Image URL to VM via cloud-init      │
│              └─ VM Boots with Automatic Deployment              │
│                                                                   │
│  VM Boot → Cloud-Init Script (on the VM)                        │
│              ├─ Install Docker                                  │
│              ├─ Pull Image from ACR                             │
│              ├─ Install Nginx Reverse Proxy                     │
│              ├─ Install Certbot & Let's Encrypt                 │
│              ├─ Request SSL Certificate                         │
│              ├─ Setup Auto-Renewal (daily)                      │
│              └─ Start Application (HTTPS Ready)                 │
│                                                                   │
│  Result: Live HTTPS Application (~15-20 min total)          │
└─────────────────────────────────────────────────────────────────┘
```

### Cloud Infrastructure Layout

```
AZURE SUBSCRIPTION (southafricanorth region)
│
├─ Virtual Network (VNet): 10.0.0.0/16
│  │
│  ├─ Public Subnet (Bastion): 10.0.1.0/24
│  │  └─ Azure Bastion Host
│  │     └─ Public IP: [BASTION_HOST_IP]
│  │
│  ├─ Private Subnet (App): 10.0.2.0/24
│  │  └─ Application VM (Ubuntu 22.04)
│  │     ├─ Docker Container (Node.js)
│  │     ├─ Nginx Reverse Proxy
│  │     └─ Certbot/Let's Encrypt
│  │
│  └─ Database Subnet: 10.0.3.0/24
│     └─ PostgreSQL 15 Flexible Server
│        └─ Private endpoint (no public access)
│
├─ Network Security Groups (Firewalls)
│  ├─ Bastion NSG
│  │  └─ Allow: SSH (22) from your IP
│  │
│  └─ App NSG
│     ├─ Allow: SSH (22) from Bastion subnet
│     └─ Allow: HTTP (80), HTTPS (443) from Internet
│
└─ Azure Container Registry (ACR)
   └─ Stores Docker images
      └─ Login: ACR_LOGIN_SERVER / ACR_USERNAME / ACR_PASSWORD
```

## � Deployment Guide

### No Manual Setup Required!

The entire deployment is **fully automated**. Here's what you need to know:

#### One-Time Setup (Before First Deployment)

1. **GitHub Secrets Configuration** (5 minutes)
   - Go to **GitHub → Your Repo → Settings → Secrets and variables → Actions**
   - Create these 3 secrets (for Azure Container Registry):
     - `ACR_LOGIN_SERVER` — Your ACR hostname (e.g., `myacr.azurecr.io`)
     - `ACR_USERNAME` — ACR admin username
     - `ACR_PASSWORD` — ACR admin password
   - **Where to get values**: Azure Portal → Container Registries → Your ACR → Access Keys

2. **HCP Terraform Configuration** (5 minutes)
   - Go to **https://app.terraform.io/app/Team_404/Agri-price-tracker**
   - Click **Variables** tab
   - Add these **Terraform Variables**:
     - `db_username` → `agreadmin`
     - `db_password` → Strong password (mark as **Sensitive**)
     - `ssh_public_key` → (leave empty, auto-generated)
   - Click **Save variable** for each

3. **DuckDNS Domain Setup** (5 minutes)
   - Go to **https://www.duckdns.org**
   - Create account and domain: `agri-price-tracker`
   - Copy your **token** (used for IP updates)
   - Note: Domain will point to Bastion public IP (see below)

#### Deploy Infrastructure

1. Go to **https://app.terraform.io/app/Team_404/Agri-price-tracker**
2. Click **New Run** → **Plan and Apply**
3. Review the 21 resources (VNet, Subnets, VM, Database, ACR, NSGs, etc.)
4. Click **Confirm & Apply**
5. Wait 5-10 minutes for infrastructure to be created

#### Get Output Values for DuckDNS

Once Terraform completes:
1. Go to **Runs** → Latest run
2. Expand **Outputs** section
3. Copy `bastion_host_ip` value
4. Update DuckDNS:
   ```bash
   # Replace YOUR_TOKEN and BASTION_IP
   curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=YOUR_TOKEN&ip=BASTION_IP"
   ```
   Or use [DuckDNS web interface](https://www.duckdns.org) to update manually

#### Trigger Automated Deployment

```bash
cd Agri-price-tracker
git commit --allow-empty -m "Deploy: Trigger automated cloud-init deployment"
git push origin main
```

Then the fully automated flow begins:
1. GitHub Actions builds Docker image (~3 min)
2. Pushes image to ACR (~1 min)
3. Terraform creates VM with cloud-init script (~5 min)
4. VM boots and cloud-init runs (~5-7 min):
   - Installs Docker, Nginx, Certbot
   - Pulls Docker image from ACR
   - Waits for DuckDNS domain to resolve
   - Requests SSL certificate from Let's Encrypt
   - Configures HTTPS with auto-renewal
   - Starts application container

**Total time: ~15-20 minutes from Git push to live HTTPS application**

#### Access Your Application

After cloud-init completes:
- **HTTP**: `http://agri-price-tracker.duckdns.org` (auto-redirects to HTTPS)
- **HTTPS**: `https://agri-price-tracker.duckdns.org` (with valid Let's Encrypt certificate)

### Cloud-Init Automatic Deployment Process

The cloud-init script (`terraform/cloud-init.tpl`) handles all deployment automatically:

#### What Cloud-Init Does

1. **Phase 1-3**: Install Docker, Nginx, Certbot packages
2. **Phase 4-5**: Configure Nginx for HTTP + Let's Encrypt ACME validation
3. **Phase 6-7**: Login to ACR, pull and run Docker container
4. **Phase 8-9**: Wait for DNS, request SSL certificate from Let's Encrypt
5. **Phase 10**: Configure Nginx for HTTPS with security headers
6. **Phase 11**: Setup daily certificate auto-renewal via cron
7. **Phase 12**: Display deployment summary with log locations

**All automatically, without any manual intervention!**

#### Monitor Deployment Progress

SSH into the VM to watch deployment:

```bash
# Get Bastion IP from Terraform outputs
BASTION_IP="<your-bastion-public-ip>"

# SSH in
ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@$BASTION_IP

# View deployment logs in real-time
tail -f /var/log/agri-price-tracker-deploy.log
```

### GitHub Workflow: CI → Build → Push → Deploy

```
┌──────────────────────────────────────────────────────────────────────┐
│                    YOU: Make Code Change & Push                       │
│                                                                        │
│  $ git add .                                                          │
│  $ git commit -m "feat: update dashboard"                            │
│  $ git push origin feat/my-feature                                   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
┌──────────────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS CI (GitHub-hosted runner)                 │
│                                                                        │
│  1. Lint code (ESLint)                                   [✓ Pass]    │
│  2. Run tests                                            [✓ Pass]    │
│  3. Build Docker image                                  [✓ Built]   │
│  4. Scan image with Trivy (fail on CRITICAL)            [✓ Safe]    │
│  5. Validate Terraform                                  [✓ Valid]   │
│  6. Scan Terraform with tfsec (fail on CRITICAL)        [✓ Safe]    │
│                                                                        │
│  ✓ All checks pass → PR mergeable                                    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
┌──────────────────────────────────────────────────────────────────────┐
│                  YOU: Create PR & Request Review                      │
│                                                                        │
│  → GitHub PR created                                                 │
│  → CI checks run automatically                                       │
│  → Request code review from team                                     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
┌──────────────────────────────────────────────────────────────────────┐
│              TEAM: Review & Approve (if looks good)                   │
│                                                                        │
│  → Changes reviewed                                                  │
│  → PR approved                                                       │
│  → Merge to main                                                     │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
┌──────────────────────────────────────────────────────────────────────┐
│            GITHUB ACTIONS CD (GitHub-hosted runner)                   │
│                                                                        │
│  1. Run all CI checks again                             [✓ Pass]    │
│  2. Build Docker image                                 [✓ Built]   │
│  3. Push image to ACR (with commit SHA + latest tags) [✓ Pushed]   │
│  4. Announce deployment ready via workflow logs                      │
│                                                                        │
│  ✓ Image ready in ACR for deployment                                │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
┌──────────────────────────────────────────────────────────────────────┐
│                  AUTOMATIC: Cloud-Init Deployment                     │
│                     (when VM is provisioned/rebooted)                 │
│                                                                        │
│  VM boots with cloud-init script that:                               │
│  1. Installs Docker            [✓ Done]                              │
│  2. Installs Nginx             [✓ Done]                              │
│  3. Installs Certbot           [✓ Done]                              │
│  4. Pulls Docker image from ACR [✓ Done]                             │
│  5. Runs application container [✓ Done]                              │
│  6. Requests SSL certificate   [✓ Done]                              │
│  7. Configures HTTPS           [✓ Done]                              │
│  8. Sets up auto-renewal       [✓ Done]                              │
│                                                                        │
│  ✓ Application live at https://agri-price-tracker.duckdns.org   │
└──────────────────────────────────────────────────────────────────────┘
```

## Local Development

### Quick Start (3 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/Agri-price-tracker.git
cd Agri-price-tracker

# Start with docker-compose
docker compose up --build

# Application available at:
# http://localhost:3000
```

### Manual Setup (for development)

```bash
# Install dependencies
npm install

# Start backend
npm run dev:backend

# In another terminal, start frontend
npm run dev:frontend

# Access at http://localhost:3000
```

### Running Tests

```bash
# Lint code
npm run lint

# Run tests
npm test

# Build Docker image
docker build -t agri-price-tracker:local .

# Run container
docker run -p 3000:3000 agri-price-tracker:local
```



### GitHub Secrets (For ACR Access)

Go to **GitHub Repo → Settings → Secrets and variables → Actions**

Create these secrets:

| Secret Name | Value | Where to Get | Required |
|---|---|---|---|
| `ACR_LOGIN_SERVER` | Azure Container Registry login server | Azure Portal → Container Registries → Access Keys | Yes |
| `ACR_USERNAME` | ACR admin username | Same as above | Yes |
| `ACR_PASSWORD` | ACR admin password | Same as above | Yes |

**Steps to get ACR credentials:**
1. Go to **Azure Portal**
2. Search for **Container Registries**
3. Click your ACR
4. Go to **Settings → Access Keys**
5. If "Admin user" is not enabled, enable it
6. Copy the values

### HCP Terraform Variables (For Infrastructure)

Go to **https://app.terraform.io/app/Team_404/Agri-price-tracker → Variables**

Create these as **Terraform Variables**:

| Variable Name | Value | Sensitive | Notes |
|---|---|---|---|
| `db_username` | `agreadmin` | No | Database admin username |
| `db_password` | Strong password (12+ chars) | **Yes** Mark sensitive | Database admin password |
| `ssh_public_key` | (leave empty) | No | Auto-generated by Terraform |

**Steps:**
1. Go to HCP Terraform workspace
2. Click **Variables** tab
3. Click **Create variable**
4. Select **Terraform variable**
5. Enter name and value
6. If sensitive, check **Sensitive** checkbox
7. Click **Save variable**
8. Repeat for each variable

## Domain Configuration (DuckDNS)

### What is DuckDNS?

DuckDNS is a **free dynamic DNS service**. It lets your domain point to a changing IP address without manual updates.

### Setup Steps

1. **Create DuckDNS Account**
   - Go to **https://www.duckdns.org**
   - Login with GitHub
   - Create domain: `agri-price-tracker`

2. **Get Your Token**
   - From DuckDNS dashboard, copy your **token** (long string)
   - Keep this safe

3. **Update DuckDNS with Azure Bastion IP**
   - After Terraform deployment, get Bastion public IP from outputs
   - Update DuckDNS:
     ```bash
     # Option A: cURL
     curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=YOUR_TOKEN&ip=BASTION_IP"
     
     # Option B: Web interface
     # Go to https://www.duckdns.org, click domain, update IP manually
     ```

4. **Verify DNS Resolution**
   ```bash
   nslookup agri-price-tracker.duckdns.org
   # Should return your Bastion public IP
   ```

### Using Your Domain

Once DNS is updated:
- **HTTP**: `http://agri-price-tracker.duckdns.org`
- **HTTPS**: `https://agri-price-tracker.duckdns.org` (auto-configured by cloud-init)

## API Reference

### GET /api/prices

Returns current prices for all tracked commodities.

**Request**:
```bash
curl https://agri-price-tracker.duckdns.org/api/prices
```

**Response** (200 OK):
```json
{
  "country": "Ghana",
  "generatedAt": "2026-03-31T10:30:00.000Z",
  "items": [
    {
      "crop": "Maize",
      "market": "Kumasi Central Market",
      "unit": "100kg bag",
      "priceGHS": 760,
      "lastUpdated": "2026-03-31"
    },
    {
      "crop": "Rice",
      "market": "Accra Central Market",
      "unit": "50kg bag",
      "priceGHS": 320,
      "lastUpdated": "2026-03-31"
    }
  ]
}
```

**Commodities Tracked**: Maize, Rice, Cassava, Yam, Tomatoes, Cocoa

**Markets**: Kumasi, Accra, Takoradi, Tema, Sekondi, Cape Coast

**Status Codes**:
- `200` — Success
- `404` — Endpoint not found
- `500` — Server error

## Security Implementation

### Network Security Architecture

```
Internet
   ↓
Azure NSG (Firewall)
   ├─ Allow: HTTPS (443) from anywhere
   ├─ Allow: HTTP (80) from anywhere
   └─ Allow: SSH (22) from specific IPs
         ↓
Nginx (Reverse Proxy)
   ├─ HTTPS with Let's Encrypt
   ├─ HTTP → HTTPS redirect
   └─ Security headers
         ↓
Docker Container (Node.js)
   └─ Application (port 3000)
         ↓
PostgreSQL (Private)
   └─ Accessible only from App VM
```

### Security Features

**Transport Security**
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HTTP/2 support

**Application Security**
- Strict CORS headers
- X-Frame-Options: SAMEORIGIN
- Content-Type validation
- HSTS (HTTP Strict Transport Security)

**SSL Certificates**
- Automatic via Let's Encrypt
- 90-day expiration
- Daily auto-renewal
- Zero downtime renewal

**Access Control**
- Private VNet for databases
- Bastion host for SSH access
- Network Security Groups (firewalls)
- SSH key-based authentication

**CI/CD Security**
- Trivy scans Docker images
- tfsec scans Terraform
- ESLint security rules
- Fails build on CRITICAL vulnerabilities

## Repository Structure

```
Agri-price-tracker/
├── agriprice-ghana/           # Application code
│   ├── package.json          # Dependencies
│   └── README.md             # App-specific docs
│
├── terraform/                # Infrastructure as Code
│   ├── main.tf              # Main resource definitions
│   ├── provider.tf          # Terraform provider config
│   ├── variables.tf         # Variable definitions
│   ├── outputs.tf           # Output definitions
│   ├── cloud-init.tpl       # VM provisioning script
│   └── README.md            # Terraform guide
│
├── ansible/                 # Configuration Management
│   ├── deploy.yml          # Playbook for system setup
│   ├── inventory.ini        # Host inventory
│   └── README.md            # Ansible guide
│
├── .github/workflows/       # CI/CD Pipelines
│   ├── ci.yml              # Runs on PR: lint, test, scan
│   └── cd.yml              # Runs on merge: build, push
│
├── docker/
│   └── Dockerfile          # Multi-stage Docker build
│
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
└── .gitignore             # Git ignore rules
```

## Deployment Workflows

### CI Pipeline (Automated on Pull Requests)

Triggered when code pushed to non-main branches or PR created:

```
Commit → GitHub Actions CI
           ├─ Setup Node.js
           ├─ Install dependencies
           ├─ Run linting (ESLint)
           ├─ Run tests
           ├─ Build Docker image
           ├─ Scan with Trivy (CRITICAL fails build)
           ├─ Validate Terraform
           └─ Scan with tfsec (CRITICAL fails build)
           
Result: PR can merge only if ALL checks pass
```

### CD Pipeline (Automated on Main Merge)

Triggered when PR merged to main branch:

```
Code merged to main → GitHub Actions CD
                       ├─ Run all CI checks (again)
                       ├─ Build Docker image
                       ├─ Push to Azure Container Registry
                       └─ Ready for cloud-init deployment
                          (VM auto-pulls latest image on boot/restart)

Result: New Docker image deployed via cloud-init
        with zero manual SSH or Ansible steps
```

## Configuration

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=https://agri-price-tracker.duckdns.org/api
```

**Backend** (`.env`):
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://agreadmin:password@db-host:5432/agriprice_ghana
CORS_ORIGIN=https://agri-price-tracker.duckdns.org
```

### Cloud-Init Variables

The `terraform/cloud-init.tpl` script receives these variables from Terraform:
- `docker_image` — Full ACR image URL (including tag)
- `acr_login_server` — ACR hostname
- `acr_username` — ACR admin username
- `acr_password` — ACR admin password
- `domain_name` — DuckDNS domain (agri-price-tracker.duckdns.org)
- `cert_email` — Email for Let's Encrypt certificate renewal alerts

### Database

PostgreSQL 15 running in private Azure subnet with tables:
- `commodities` — Crop information (Maize, Rice, etc.)
- `prices` — Current market prices
- `markets` — Location information (Kumasi, Accra, etc.)

Connection via private VNet link (not exposed to public internet).

## Database Schema

```sql
-- Commodities
CREATE TABLE commodities (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Markets
CREATE TABLE markets (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50),
  country VARCHAR(50)
);

-- Prices (current)
CREATE TABLE prices (
  id UUID PRIMARY KEY,
  commodity_id UUID REFERENCES commodities(id),
  market_id UUID REFERENCES markets(id),
  price_ghs DECIMAL(10, 2),
  unit VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Local Testing

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build Docker image
docker build -t agri-price-tracker:local .

# Test with docker-compose
docker compose up --build
# Then visit http://localhost:3000
```

### Infrastructure Testing

```bash
# Validate Terraform
terraform -chdir=terraform validate

# Plan deployment
terraform -chdir=terraform plan -out=tfplan

# Check cloud-init script syntax
bash -n terraform/cloud-init.tpl
```

## Continuous Integration/Deployment (CI/CD)

### Branch Strategy

```
Protected main branch
  ↑
  ├─ feature/* branches (from this, create PRs)
  ├─ fix/* branches (for bug fixes)
  └─ docs/* branches (for documentation)

All PRs must:
  1. Pass CI checks (lint, test, security scans)
  2. Have at least 1 code review approval
  3. Have zero merge conflicts
  4. Have descriptive commit messages
```

### Protected Branch Rules

In GitHub Settings → Branches → main:

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Require code reviews (1 approval)
- [x] Dismiss stale PR approvals
- [x] Include administrators (required)

## Git Workflow

**Making a code change**:

```bash
# Create feature branch
git checkout -b feat/short-description

# Make changes
vim agriprice-ghana/frontend/src/pages/DashboardPage.jsx

# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat: update dashboard title"

# Push to GitHub
git push origin feat/short-description

# Create Pull Request on GitHub
# Wait for CI to pass
# Request code review
# Once approved, merge to main
# CD pipeline deploys automatically
```

**Commit message conventions**:
```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
test: test additions
chore: dependency updates
```

## Advanced Usage

### Local SSH Access (for debugging)

```bash
# Connect to Bastion
BASTION_IP=$(terraform output -raw bastion_host_ip)
ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@$BASTION_IP

# View cloud-init deployment logs
tail -f /var/log/agri-price-tracker-deploy.log

# Check running containers
docker ps
docker ps -a  # Show all including stopped

# View application logs
docker logs agric-price-tracker-app -f

# Check Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check Certbot certificate
sudo certbot certificates

# Exit
exit
```

### Modifying Infrastructure

Edit variables and redeploy:

```bash
# Update HCP Terraform variables
# Go to: https://app.terraform.io/app/Team_404/Agri-price-tracker → Variables

# Then trigger a new run manually or push a new commit
git commit --allow-empty -m "chore: trigger terraform update"
git push origin main
```

### Redeploying Application (Latest Docker Image)

```bash
# Force VM to pull latest image by rebooting
# Option 1: Via Terraform
cd terraform
terraform apply -target=azurerm_linux_virtual_machine.app_vm -refresh=true

# Option 2: Via Azure Portal
# Go to VM → Overview → Restart
```

## Troubleshooting

### Local Development Issues

**Port already in use**:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Stop-Process -Force

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Docker image not building**:
```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t agri-price-tracker .
```

**Module not found (Node.js)**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm ci
```

### Infrastructure & Deployment Issues

**Cloud-Init Deployment Fails**

1. **SSH into VM and check logs**:
   ```bash
   ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@$BASTION_IP
   tail -100 /var/log/agri-price-tracker-deploy.log
   ```

2. **Common issues**:
   - DNS not resolving: Domain not properly configured in DuckDNS
   - Port 80 blocked: Check Network Security Group allows port 80
   - Docker login fails: Verify ACR credentials passed to cloud-init
   - Certificate request fails: Check domain resolves before running certbot

**Terraform State Issues**:
```bash
# Reload from HCP Terraform
terraform refresh

# Or show current state
terraform state list
terraform state show azurerm_linux_virtual_machine.app_vm
```

**Application not responding at domain**

1. Check DuckDNS is pointing to correct IP:
   ```bash
   nslookup agri-price-tracker.duckdns.org
   # Should return Bastion public IP
   ```

2. Check cloud-init logs on VM:
   ```bash
   tail -100 /var/log/agri-price-tracker-deploy.log
   ```

3. Check container is running:
   ```bash
   docker ps | grep agric-price-tracker
   docker logs agric-price-tracker-app | tail -50
   ```

**SSL certificate not obtained**

1. Verify domain resolves to public IP:
   ```bash
   nslookup agri-price-tracker.duckdns.org
   ```

2. Check port 80 is accessible:
   ```bash
   curl -I http://agri-price-tracker.duckdns.org/
   ```

3. Check Nginx is running:
   ```bash
   sudo systemctl status nginx
   sudo nginx -t  # Test config
   ```

**SSH access denied**

1. Check SSH key path:
   ```bash
   ls -la terraform/ssh-key-agric-price-tracker.pem
   ```

2. Check Bastion IP is correct:
   ```bash
   terraform output bastion_host_ip
   ```

3. Verify SSH key permissions:
   ```bash
   chmod 600 terraform/ssh-key-agric-price-tracker.pem
   ```

**Docker image not updating**

1. Force pull latest image from ACR:
   ```bash
   docker pull myacr.azurecr.io/agri-price-tracker:latest
   docker run -d -p 80:3000 myacr.azurecr.io/agri-price-tracker:latest
   ```

2. Or restart VM to trigger cloud-init re-execution:
   ```bash
   terraform apply -target=azurerm_linux_virtual_machine.app_vm
   ```

## Documentation

For detailed guides, see:

| Document | Purpose |
|----------|---------|
| [terraform/README.md](terraform/README.md) | Complete Infrastructure as Code guide |
| [ansible/README.md](ansible/README.md) | Configuration management & playbook details |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to the project |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | CI pipeline source code |
| [.github/workflows/cd.yml](.github/workflows/cd.yml) | CD pipeline source code |

## Next Steps

After infrastructure is deployed:

1. **Monitor Application Logs**
   ```bash
   ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@BASTION_IP
   docker logs agric-price-tracker-app -f
   ```

2. **Verify HTTPS Certificate**
   ```bash
   curl -I https://agri-price-tracker.duckdns.org/
   # Should show: 200 OK
   ```

3. **Check Certificate Expiry**
   ```bash
   openssl s_client -connect agri-price-tracker.duckdns.org:443 </dev/null | \
   openssl x509 -noout -dates
   ```

4. **Make Code Changes and Push**
   ```bash
   git checkout -b feat/my-feature
   # Make changes...
   git commit -m "feat: describe change"
   git push origin feat/my-feature
   # Create PR on GitHub
   # Once approved & merged, it auto-deploys!
   ```

## Key Features of This Setup

- **Zero Manual Deployments** — Push code → Auto-deploys  
- **Automatic HTTPS** — Let's Encrypt with daily renewal  
- **Infrastructure as Code** — Reproducible, version-controlled  
- **Security Scanning** — Trivy, tfsec, ESLint in CI/CD  
- **Private Database** — Not exposed to internet  
- **Bastion Host** — Secure SSH access  
- **DuckDNS Domain** — Free DNS with dynamic IP support  
- **Cloud-Init Automation** — No manual setup needed
