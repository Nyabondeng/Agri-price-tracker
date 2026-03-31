# Quick Start Guide

Get your Agri Price Tracker application running in. minutes.

## 3-Minute Local Start

```bash
# Clone repo
git clone https://github.com/Nyabondeng/Agri-price-tracker.git
cd Agri-price-tracker

# Option A: Basic start (requires Node.js 22+)
npm install
npm start
# → Open http://localhost:3000

# Option B: With Docker (requires Docker Desktop)
docker compose up --build
# → Open http://localhost:3000
```

## 30-Minute Production Deployment

### Prerequisites
- Azure account (free tier eligible)
- Terraform installed
- Git and GitHub account
- SSH client

### Step 1: Clone & Initialize (2 min)

```bash
git clone https://github.com/Nyabondeng/Agri-price-tracker.git
cd Agri-price-tracker
```

### Step 2: Create Infrastructure (10 min)

```bash
cd terraform

terraform init

terraform apply \
  -var="db_username=admin" \
  -var="db_password=SecurePassword123!"

# Wait for completion... resource creation takes 5-10 minutes

# Get important outputs:
terraform output
```

Save these values:
- `bastion_host_ip` = Your Bastion public IP
- `app_vm_private_ip` = App VM private IP  
- `acr_login_server` = Docker registry URL

### Step 3: Configure GitHub Secrets (5 min)

Go to GitHub → Settings → Secrets and variables → Actions

Add these secrets (from Azure Portal and Terraform output):
1. `ACR_LOGIN_SERVER` — Docker registry URL
2. `ACR_USERNAME` — ACR username
3. `ACR_PASSWORD` — ACR password
4. `BASTION_HOST` — Bastion public IP
5. `APP_PRIVATE_IP` — App VM private IP
6. `SSH_PRIVATE_KEY` — Content of `terraform/ssh-key-agric-price-tracker.pem`

### Step 4: Deploy (3 min)

```bash
# Make a change and push
echo "# Updated" >> README.md
git add README.md
git commit -m "docs: trigger deployment"
git checkout -b feat/demo
git push origin feat/demo

# Create Pull Request on GitHub
# Wait for CI checks to pass (2 min)
# Merge to main
# CD pipeline runs automatically (2 min)
# Application deployed!
```

## Verify Deployment

```bash
# Check Bastion is reachable
ping <BASTION_IP>

# SSH into app VM
ssh -i terraform/ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i terraform/ssh-key-agric-price-tracker.pem -W %h:%p azureuser@<BASTION_IP>" \
    azureuser@<APP_VM_PRIVATE_IP>

# Check container is running
docker ps

# Verify application
curl http://localhost:3000/api/prices

exit
```

## Domain Access (Optional)

Set up free domain access with DuckDNS:

```bash
# Get Bastion IP
terraform output bastion_host_ip

# Update DuckDNS (via browser or curl)
curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=YOUR_TOKEN&ip=<BASTION_IP>"

# In 5-30 minutes:
# http://agri-price-tracker.duckdns.org/ → accessible
```

See [docs/DUCKDNS.md](docs/DUCKDNS.md) for complete setup.

## Useful Commands

### Local Development

```bash
# Frontend dev server (hot reload)
cd agriprice-ghana/frontend
npm run dev
# → http://localhost:5173

# Backend dev server
cd agriprice-ghana/backend
npm start
# → http://localhost:5000

# Linting
npm run lint / npm run lint:fix

# Tests
npm test

# Docker Compose
docker compose up --build
docker compose down
```

### Infrastructure

```bash
# Terraform
cd terraform

terraform plan     # Preview changes
terraform apply    # Create/update resources
terraform destroy  # Remove all resources
terraform output   # Show current IPs/URLs

# Get specific values
terraform output bastion_host_ip
terraform output app_vm_private_ip
```

### Deployment

```bash
# Check GitHub Actions
# → GitHub → Actions tab → Monitor workflows

# View live deployment logs
# → Actions → CD workflow → Click job for logs

# Manual Ansible deployment (advanced)
cd ansible
ansible-playbook -i inventory.ini deploy.yml --check  # dry-run
ansible-playbook -i inventory.ini deploy.yml          # actual
```

## Documentation Index

| Need | File |
|------|------|
| Full setup guide | [README.md](README.md) |
| Infrastructure details | [terraform/README.md](terraform/README.md) |
| Configuration management | [ansible/README.md](ansible/README.md) |
| GitHub Secrets setup | [docs/GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md) |
| Domain configuration | [docs/DUCKDNS.md](docs/DUCKDNS.md) |
| Testing procedures | [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md) |
| Troubleshooting | [README.md#-troubleshooting](README.md#-troubleshooting) |

## Common Issues

**"Port 3000 already in use"**
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Stop-Process -Force

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**"SSH timeout"**
```bash
# Verify Bastion is reachable
ping <BASTION_IP>

# Check SSH key permissions
chmod 600 terraform/ssh-key-agric-price-tracker.pem
```

**"Terraform apply fails"**
```bash
# Check Azure credential
az login
az account show

# Validate Terraform
terraform validate
terraform fmt -check -recursive
```

**"CI/CD not running"**
- Check GitHub Actions tab for errors
- Verify branch protection on main is enabled
- Confirm required status checks are set

See [README.md#-troubleshooting](README.md#-troubleshooting) for more.

## What's Next?

- ✅ Deploy infrastructure
- ✅ Configure GitHub Secrets
- ✅ Make code changes and auto-deploy
- 🎥 Record demo video (10-15 min)
- 📝 Update README with live URL
- 📤 Submit to Canvas

**Estimated Total Time**: 1-2 hours (mostly waiting for infrastructure creation)

## Need Help?

1. Check [README.md](README.md) for comprehensive documentation
2. Review [docs/DEPLOYMENT_TESTING.md](docs/DEPLOYMENT_TESTING.md) for step-by-step testing
3. Check workflow logs in GitHub Actions tab
4. Review infrastructure in Azure Portal

---

**Ready?** Start with Step 1 above! 🚀
