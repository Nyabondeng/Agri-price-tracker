# Agri Price Tracker Ghana

**Helping Ghanaian farmers, traders, and households make better crop pricing decisions with simple, timely market data.**

## 🚀 Live Application

- **Development**: `http://localhost:3000/`
- **Production Domain**: `http://agri-price-tracker.duckdns.org/` (when deployed)
- **API Endpoint**: `/api/prices` (JSON format)

> **Note**: Production URL requires infrastructure deployment. See [Deployment Guide](#deployment-guide) below.

## 📋 Problem Statement & Impact

**Challenge**: Ghana faces rising food prices and agricultural commodity instability. Smallholder farmers, market traders, and urban households lack timely, comparable price information for staples, leading to:
- Poor selling decisions (lost revenue for farmers)
- Inefficient purchasing (extra costs for traders)
- Budget uncertainty (hardship for households)

**Solution**: Agri Price Tracker provides:
- ✅ Real-time commodity prices across Ghanaian markets
- ✅ Simple, accessible interface (no technical expertise needed)
- ✅ Machine-readable API for integration
- ✅ Foundation for future alerts and trend analysis

**Target Users**:
- Smallholder farmers (6+ million in Ghana)
- Market traders and aggregators
- Urban/peri-urban households tracking staple prices

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Application** | Node.js 22, Express.js | Backend API and web server |
| **Frontend** | React 18, Vite, Tailwind CSS | Modern UI with hot reload |
| **Database** | PostgreSQL 15 | Persistent data storage |
| **Containerization** | Docker, Docker Compose | Reproducible deployments |
| **Infrastructure** | Terraform 1.6+ | Infrastructure as Code (Azure) |
| **Config Mgmt** | Ansible 2.9+ | Automated server setup |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Registry** | Azure Container Registry (ACR) | Private image storage |
| **Domain** | DuckDNS | Free dynamic DNS service |
| **Cloud** | Microsoft Azure | Production cloud platform |

## 👥 Team Roles & Responsibilities

| Team Member | Role | Responsibilities |
|------------|------|-----------------|
| Nyabon Deng Adut | Backend Developer | Server-side API, data models |
| Christelle Usanase | Documentation Lead | README, diagrams, guides |
| Agnes Adepa Berko | DevOps Coordinator | CI/CD, Infrastructure, Deployment |
| Nduka-aku Oluchi Rejoice | Team Lead | Overall direction, coordination |

## ✨ Current Features

- [x] Display real-time prices for 6 commodities (Maize, Rice, Cassava, Yam, Tomatoes, Cocoa)
- [x] Show prices across 6 major Ghanaian markets
- [x] JSON API endpoint (`GET /api/prices`)
- [x] Responsive web interface
- [x] Database integration (PostgreSQL)
- [x] Containerized deployment
- [x] Production-ready CI/CD pipeline

## 📊 Architecture Overview

### High-Level Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER WORKFLOW                        │
│                                                                   │
│  Git Push to Feature Branch → Create PR → GitHub Actions CI      │
│              │                              │                    │
│              └──────────────────┬───────────┘                    │
│                                 │                                │
│                    (Linting, Tests, Security Scans)             │
│                                 │                                │
│        Merge to main (if all checks pass)                       │
│              │                                                   │
│              v                                                   │
│        GitHub Actions CD                                         │
│     (Build, Push, Deploy)                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              v
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUD INFRASTRUCTURE                        │
│                        (Azure Region)                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             Virtual Network (VNet)                        │   │
│  │           10.0.0.0/16                                    │   │
│  │                                                            │   │
│  │  ┌─────────────────────┐    ┌──────────────────────┐   │   │
│  │  │ Public Subnet       │    │  Private Subnet      │   │   │
│  │  │ (10.0.1.0/24)       │    │  (10.0.2.0/24)       │   │   │
│  │  │                     │    │                      │   │   │
│  │  │ ┌─────────────────┐ │    │ ┌──────────────────┐ │   │   │
│  │  │ │ Azure Bastion   │ │    │ │  App VM          │ │   │   │
│  │  │ │ (Jump Host)     │◄──SSH──┤  Docker          │ │   │   │
│  │  │ │ Public IP:      │ │    │ │  Container       │ │   │   │
│  │  │ │ 52.xxx.xxx.xxx  │ │    │ │  Private IP:     │ │   │   │
│  │  │ └─────────────────┘ │    │ │  10.0.2.x        │ │   │   │
│  │  │                     │    │ └──────────────────┘ │   │   │
│  │  └─────────────────────┘    └──────────────────────┘   │   │
│  │                                      │                  │   │
│  │                                 database/               │   │
│  │                                      │                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Database Subnet (10.0.3.0/24)                   │  │   │
│  │  │  PostgreSQL Database (Private)                   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                    Docker Image Storage                          │
│              Azure Container Registry (ACR)                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              v
                        ┌─────────────┐
                        │   Internet  │
                        │ (Users)     │
                        └─────────────┘
```

### Security Model

```
Internet Traffic Flow:
  User → (HTTPS) → DuckDNS (agri-price-tracker.duckdns.org)
                      ↓
                   Azure
                      ↓
  (Option 1) Load Balancer → App VM (Port 80/443)
  (Option 2) SSH Tunnel via Bastion → App VM (Port 3000)

Private Access (Admin/DevOps):
  SSH → Bastion (Port 22, restricted) → App VM (Port 22)
  Bastion → PostgreSQL (Port 5432)
```

## 📚 Complete Development & Deployment Guide

### Local Development (For Testing)

#### Prerequisites
- Node.js 22+
- Docker Desktop
- Git

#### Quick Start

```bash
# Clone repository
git clone https://github.com/Nyabondeng/Agri-price-tracker.git
cd Agri-price-tracker

# Install dependencies
npm install

# Start development server
npm start

# Frontend also available at:
cd agriprice-ghana/frontend && npm run dev
# Vite dev server: http://localhost:5173

# Backend in another terminal:
cd agriprice-ghana/backend && npm start
# Express server: http://localhost:5000
```

### Docker Compose Deployment

```bash
# Build and run all services
docker compose up --build

# Navigate to http://localhost:3000

# Stop services
docker compose down
```

### Production Deployment (Azure Infrastructure)

**Complete deployment requires**:

1. **Azure Account Setup** (see [Terraform README](terraform/README.md))
2. **Infrastructure Provisioning** (Terraform)
3. **CI/CD Configuration** (GitHub Secrets)
4. **Automated Deployment** (GitHub Actions)

#### Step 1: Terraform Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment (review resources)
terraform plan \
  -var="db_username=admin" \
  -var="db_password=YourSecurePassword123!"

# Deploy infrastructure (5-10 minutes)
terraform apply

# Save outputs for next steps
terraform output -json > outputs.json
```

**What gets created**:
- Virtual Network with 3 subnets (public, private, database)
- Azure Bastion Host (for SSH access)
- Application Virtual Machine (Ubuntu 22.04 LTS)
- PostgreSQL Database
- Azure Container Registry
- Network Security Groups
- SSH key pair

See [terraform/README.md](terraform/README.md) for detailed instructions.

#### Step 2: Configure GitHub Secrets

In GitHub Repository Settings → Secrets and variables → Actions:

**Required secrets** (for CI/CD image push):
- `ACR_LOGIN_SERVER` — From Terraform output or Azure Portal
- `ACR_USERNAME` — ACR admin username
- `ACR_PASSWORD` — ACR admin password

**Recommended secrets** (for VM deployment):
- `BASTION_HOST` — Public IP of Bastion (Terraform output: `bastion_host_ip`)
- `APP_PRIVATE_IP` — Private IP of App VM (Terraform output: `app_vm_private_ip`)
- `SSH_PRIVATE_KEY` — SSH private key (from `terraform/ssh-key-agric-price-tracker.pem`)

See [docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md) for step-by-step guide.

#### Step 3: Trigger Deployment

```bash
# Make a code change
echo "# Updated" >> README.md

# Commit and push to feature branch
git checkout -b feat/update-readme
git add .
git commit -m "docs: update readme"
git push origin feat/update-readme

# Create Pull Request on GitHub
# CI pipeline runs automatically (lint, test, security scans)

# Once all checks pass, merge to main
# CD pipeline runs automatically:
#   1. Build Docker image
#   2. Push to ACR
#   3. Deploy via Ansible playbook
#   4. Application updated in ~2-3 minutes
```

#### Step 4: Configure Domain

Link DuckDNS to your Bastion Host IP:

```bash
# Get Bastion IP
terraform output bastion_host_ip

# Update DuckDNS
# See docs/DUCKDNS.md for detailed instructions
```

### Complete Testing & Validation

See [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md) for comprehensive testing checklist covering:

- ✅ Infrastructure tests
- ✅ Connectivity tests
- ✅ CI pipeline validation
- ✅ CD pipeline validation
- ✅ End-to-end Git-to-Production flow
- ✅ Cleanup and teardown

## 📖 Documentation Files

| Document | Purpose |
|----------|---------|
| [terraform/README.md](terraform/README.md) | Infrastructure as Code guide |
| [ansible/README.md](ansible/README.md) | Configuration management guide |
| [docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md) | GitHub Secrets setup |
| [docs/DUCKDNS.md](docs/DUCKDNS.md) | Domain configuration |
| [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md) | Testing checklist |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | CI pipeline (linting, testing, security) |
| [.github/workflows/cd.yml](.github/workflows/cd.yml) | CD pipeline (build, push, deploy) |

## 🔌 API Reference

### GET /api/prices

Returns current prices for all tracked commodities.

**Request**:
```bash
curl http://localhost:3000/api/prices
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

**Status Codes**:
- `200` — Success
- `404` — Endpoint not found
- `500` — Server error

**Commodities Tracked**: Maize, Rice, Cassava, Yam, Tomatoes, Cocoa

**Markets**: Kumasi, Accra, Takoradi, Tema, Sekondi, Cape Coast

## 🔐 Security Implementation

### Network Security

```
Public Internet ←→ Azure NSG (Firewall)
                        ↓
                  Allow: HTTP/HTTPS (80, 443)
                  Allow: SSH (22) from Bastion only
                        ↓
                   Application VM
                        ↓
                  PostgreSQL (Private)
                  Allow: Port 5432 from App VM only
```

### Secret Management

- GitHub Secrets (for CI/CD credentials)
- Azure Vault (for production credentials)
- SSH key pairs (RSA 4096-bit)
- Environment variables (never hardcoded)

### DevSecOps Scanning

The CI pipeline includes:
- **Trivy**: Scans Docker images for vulnerabilities
- **tfsec**: Scans Terraform for security issues
- **ESLint**: Code quality and security rules
- **Overall**: Fails build if CRITICAL vulnerabilities detected

## 📦 Repository Structure

```
Agri-price-tracker/
├── agriprice-ghana/
│   ├── frontend/          # React Vite application
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   └── backend/           # Express Node.js API
│       ├── src/
│       └── package.json
├── terraform/             # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   └── README.md
├── ansible/               # Configuration Management
│   ├── deploy.yml
│   ├── inventory.ini
│   └── README.md
├── .github/workflows/     # CI/CD Pipelines
│   ├── ci.yml             # Triggers on PR, runs tests/scans
│   └── cd.yml             # Triggers on merge, deploys to prod
├── docs/                  # Documentation
│   ├── GITHUB_SECRETS.md
│   ├── DUCKDNS.md
│   └── DEPLOYMENT_TESTING.md
├── docker-compose.yml     # Local development compose file
├── Dockerfile             # Multi-stage Docker build
├── README.md              # This file
└── .gitignore
```

## 🚀 Deployment Workflows

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
                       ├─ Setup Ansible
                       ├─ Generate inventory from secrets
                       ├─ Connect via Bastion to private VM
                       ├─ Run Ansible playbook
                       │  ├─ Install Docker
                       │  ├─ Login to ACR
                       │  ├─ Pull latest image
                       │  └─ Deploy container
                       └─ Application live (2-3 minutes)

Result: Changes automatically deployed with zero manual steps
```

## ⚙️ Configuration

### Environment Variables

**Frontend** (`agriprice-ghana/frontend/.env`):
```
VITE_API_URL=http://localhost:5000
```

**Backend** (`agriprice-ghana/backend/.env`):
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/agriprice_ghana
CORS_ORIGIN=http://localhost:3000
```

### Database

PostgreSQL 15 with tables:
- `users` — Admin and user accounts
- `commodities` — Crop information
- `prices` — Current and historical prices
- `markets` — Location data

Connection via private VNet link (not public internet).

## 📊 Database Schema

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

## 🧪 Testing

### Local Testing

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build Docker image
docker build -t agri-price-tracker:test .

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

# Test Ansible playbook (dry-run)
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml --check

# Run Ansible playbook (actual deployment)
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

See [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md) for comprehensive testing guide.

## 🔄 Continuous Integration/Deployment (CI/CD)

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

## 📝 Git Workflow

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

## 🛠 Advanced Usage

### Local SSH Access (for debugging)

```bash
# Connect through Bastion to private VM
BASTION_IP=$(terraform output -raw bastion_host_ip)
APP_IP=$(terraform output -raw app_vm_private_ip)

ssh -i terraform/ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i terraform/ssh-key-agric-price-tracker.pem -W %h:%p azureuser@$BASTION_IP" \
    azureuser@$APP_IP

# Check running containers
docker ps

# View application logs
docker logs agric-price-tracker-app

# Restart container
docker restart agric-price-tracker-app

# Exit SSH
exit
```

### Modifying Infrastructure

Edit `terraform.tfvars` or variables in `terraform/variables.tf`:

```bash
# Change VM size (example)
sed -i 's/Standard_B2s_v2/Standard_B4ms/g' terraform/terraform.tfvars

# Plan and apply
terraform -chdir=terraform plan
terraform -chdir=terraform apply

# Wait 5-10 minutes for VM recreation
```

### Regenerating SSH Key

```bash
# Remove old key
rm terraform/ssh-key-agric-price-tracker.pem

# Regenerate
terraform -chdir=terraform force-new=azurerm_ssh_public_key.vm apply

# Update GitHub secret with new key
cat terraform/ssh-key-agric-price-tracker.pem
# (copy output, paste into GitHub Settings → Secrets → SSH_PRIVATE_KEY)
```

## 🐛 Troubleshooting

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

### Infrastructure Issues

**Terraform state corruption**:
```bash
# Reload from remote state (if using HCP Terraform)
terraform refresh

# Or show current state
terraform state list
terraform state show <resource_name>
```

**Ansible SSH timeout**:
```bash
# Check connectivity to Bastion
ping <BASTION_IP>

# Verify SSH key permissions
chmod 600 ~/.ssh/ssh-key-agric-price-tracker.pem

# Test SSH directly
ssh -vvv -i ... azureuser@<BASTION_IP>
```

**CD pipeline fails silently**:
1. Check GitHub Actions tab for logs
2. Look for "SSH_PRIVATE_KEY not set" warning (normal if deploying without secrets)
3. Verify ACR credentials are correct in GitHub Secrets
4. Run `terraform output` to confirm IPs haven't changed

See [docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md) for credential troubleshooting.

## 📚 Learning Resources

### DevOps Concepts
- [Terraform Best Practices](https://www.terraform.io/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [Infrastructure as Code](https://www.terraform.io/intro)
- [CI/CD Basics](https://en.wikipedia.org/wiki/CI/CD)

### Azure Platform
- [Azure Terraform Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Bastion Documentation](https://learn.microsoft.com/en-us/azure/bastion/)
- [Azure Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Azure Virtual Networks](https://learn.microsoft.com/en-us/azure/virtual-network/)

### Docker & Kubernetes
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request
6. Wait for CI checks to pass and code review

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 📞 Support & Communication

- **Issues**: GitHub Issues tab for bug reports
- **Discussions**: GitHub Discussions for feature requests
- **Direct**: Team members via email or Slack

---

## 📋 Deployment Checklist

Before final submission, complete [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md):

- [ ] Infrastructure deploys cleanly with Terraform
- [ ] Ansible playbook configures VM successfully
- [ ] CI pipeline runs on all PRs
- [ ] CD pipeline runs on main merges
- [ ] Security scans pass (Trivy, tfsec)
- [ ] Code changes deploy automatically
- [ ] Live application accessible via domain
- [ ] All documentation updated
- [ ] Video demo recorded (10-15 min)

---

**Last Updated**: 2026-03-31  
**Repository**: [GitHub](https://github.com/Nyabondeng/Agri-price-tracker)  
**Documentation Version**: 2.0 (Complete DevOps Pipeline)
