# Fully Automated CI/CD Deployment

## Overview

The **Agri Price Tracker** project now has **100% automated deployment** from Git commit to live production application.

## Deployment Flow

```
Developer commits code
    ↓
GitHub Actions CI Pipeline
    ├─ Lint code
    ├─ Run tests
    ├─ Security scans (Trivy, tfsec, ESLint)
    └─ All checks must pass
    ↓
GitHub Actions CD Pipeline (Self-Hosted Runner)
    ├─ Build Docker image
    ├─ Push to Azure Container Registry
    ├─ Run Ansible playbook on App VM
    │   ├─ Install & configure Nginx reverse proxy
    │   ├─ Install Certbot & Let's Encrypt support
    │   ├─ Pull Docker image from ACR
    │   ├─ Start containerized application
    │   ├─ Wait for DNS resolution
    │   ├─ Automatically request SSL certificate
    │   ├─ Configure HTTPS with auto-renewal
    │   └─ Enable HTTP→HTTPS redirect
    └─ Deployment complete
    ↓
✅ Live Application: https://agri-price-tracker.duckdns.org/
```

## Key Automated Features

### 🔐 **SSL/HTTPS Certificate**
- ✅ Automatically requested from Let's Encrypt
- ✅ Validated via DuckDNS domain
- ✅ Installed and configured in Nginx
- ✅ Auto-renewal daily at 3:30 AM
- ✅ HTTP → HTTPS redirect automatic

### 🐳 **Docker & Container Management**
- ✅ Automatic Docker installation
- ✅ Azure Container Registry login
- ✅ Pull latest image from ACR
- ✅ Container auto-restart on failure
- ✅ Latest image always deployed

### 🌐 **Web Server & Reverse Proxy**
- ✅ Nginx automatically installed
- ✅ Reverse proxy configured for port 3000
- ✅ HTTP/2 enabled for better performance
- ✅ Security headers configured
- ✅ CORS headers set correctly

### 🔄 **Continuous Deployment**
- ✅ Every push to `main` triggers deployment
- ✅ Security scans block deployment if issues found
- ✅ Terraform validates before deployment
- ✅ Ansible idempotent (safe to re-run)

### ⏰ **Certificate Management**
- ✅ Automatic renewal 90 days before expiration
- ✅ Cron job runs daily
- ✅ Nginx automatically reloads on renewal
- ✅ No manual intervention required

## Configuration Variables

The Ansible playbook uses these environment variables (configurable):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DOMAIN_NAME` | `agri-price-tracker.duckdns.org` | SSL certificate domain |
| `CERT_EMAIL` | `admin@agri-price-tracker.duckdns.org` | Let's Encrypt contact email |
| `APP_IMAGE` | From ACR | Docker image to deploy |
| `APP_PORT` | `3000` | Node.js application port |
| `ACR_LOGIN_SERVER` | From GitHub Secret | Azure Container Registry URL |
| `ACR_USERNAME` | From GitHub Secret | ACR login username |
| `ACR_PASSWORD` | From GitHub Secret | ACR login password |

## What Happens During Deployment

### Phase 1: Infrastructure Check (Self-Hosted Runner)
```
✓ Connect to App VM via SSH
✓ Authenticate to Azure Container Registry
✓ Verify network connectivity
```

### Phase 2: System Configuration (Ansible)
```
✓ Update system packages
✓ Install Docker and components
✓ Install Nginx web server
✓ Install Certbot and Let's Encrypt plugins
✓ Create Nginx reverse proxy configuration
```

### Phase 3: Asset Deployment (Ansible)
```
✓ Pull Docker image from ACR
✓ Remove old container (if exists)
✓ Start new container with environment variables
✓ Configure Nginx upstream to localhost:3000
```

### Phase 4: SSL Certificate (Ansible)
```
✓ Wait for DNS resolution (up to 5 minutes)
✓ Configure Nginx for ACME challenge
✓ Request certificate from Let's Encrypt
✓ Configure HTTPS in Nginx
✓ Setup automatic renewal cron job
```

### Phase 5: Verification (Ansible)
```
✓ Test Nginx configuration syntax
✓ Verify SSL certificate installation
✓ Confirm container is running
✓ Display deployment summary
```

## Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Checkout & Tests | ~3 min | CI pipeline |
| Build Docker | ~2 min | Create image |
| Push to ACR | ~1 min | Upload to registry |
| Ansible Setup | ~2 min | Install packages |
| Deploy Container | ~1 min | Start app |
| SSL Certificate | ~3 min | Let's Encrypt request |
| Verification | ~1 min | Final checks |
| **Total** | **~13 min** | End to end |

## Monitoring Deployment

### Watch the GitHub Actions Workflow
1. Go to **GitHub → Actions → deploy-production**
2. Click the latest run
3. Expand steps to see real-time logs
4. Check "Deploy with Ansible" step for playbook output

### Monitor Application Logs
After deployment completes, SSH to the App VM and check:

```bash
# View application logs
docker logs agric-price-tracker-app -f

# View Nginx logs
sudo tail -100 /var/log/nginx/access.log
sudo tail -100 /var/log/nginx/error.log

# Check certificate installation
ls -la /etc/letsencrypt/live/agri-price-tracker.duckdns.org/

# View certificate details
openssl x509 -in /etc/letsencrypt/live/agri-price-tracker.duckdns.org/fullchain.pem -text -noout

# View certificate renewal logs
grep certbot /var/log/syslog
```

## Troubleshooting

### "Certificate request failed"
**Cause**: DuckDNS domain not resolving to public IP  
**Fix**: Update DuckDNS with correct Bastion/App IP

### "Cannot reach host from runner"
**Cause**: SSH connectivity issue (expected for GitHub runners)  
**Solution**: Use self-hosted runner on Bastion  
**Status**: ⚠️ Manual setup required (see GITHUB_RUNNER_SETUP.md)

### "Container stops immediately"
**Cause**: Application error or missing environment variables  
**Fix**: Check logs with `docker logs agric-price-tracker-app`

### "Ansible deploy skipped"
**Cause**: CAN_DEPLOY flag is false  
**Check**:
- [ ] ACR_LOGIN_SERVER secret is set
- [ ] ACR_USERNAME secret is set
- [ ] ACR_PASSWORD secret is set
- [ ] BASTION_HOST secret is set
- [ ] APP_PRIVATE_IP secret is set
- [ ] SSH_PRIVATE_KEY secret is set
- [ ] Self-hosted runner is online and connected

## Security Features

✅ **Transport Security**
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers enabled

✅ **Application Security**
- Security headers configured
- Frame options restricted
- Content type verification
- Referrer policy enforced

✅ **Access Control**
- SSH key-based authentication
- Private Azure subnets
- Network security groups
- Azure Bastion for secure access

✅ **Certificate Management**
- Automated renewal
- No manual intervention
- Industry-standard Let's Encrypt
- 90-day expiration safety margin

## Rollback Procedure

If deployment fails, the previous configuration remains intact:

```bash
# SSH to App VM
ssh -i key.pem -o ProxyCommand="..." azureuser@APP_IP

# Check running containers
docker ps -a

# Remove new container if needed
docker rm agric-price-tracker-app

# Start previous container
docker run -d --name agric-price-tracker-app ...

# Git revert to previous commit
git revert <commit-hash>
git push  # Triggers automated redeploy
```

## Deployment Checklist (Pre-Launch)

Before your first automated deployment:

- [ ] Infrastructure deployed via Terraform
- [ ] HCP Terraform workspace configured with variables
- [ ] GitHub Secrets configured (6 required)
- [ ] Self-hosted runner online and connected
- [ ] DuckDNS account created and domain configured
- [ ] ACR credentials valid and admin user enabled
- [ ] SSH keys generated and stored securely
- [ ] Ansible playbook syntax verified

## Continuous Improvement

After each deployment, verify:

```bash
# Check HTTPS certificate
curl -I https://agri-price-tracker.duckdns.org/

# Check application response
curl https://agri-price-tracker.duckdns.org/ | head -20

# Check certificate expiration
openssl s_client -connect agri-price-tracker.duckdns.org:443 \
  </dev/null 2>/dev/null | openssl x509 -noout -dates

# Monitor renewal logs
journalctl -u cron -f  # View cron job executions
```

## Next Deployment

To trigger the next deployment after any code change:

```bash
git add .
git commit -m "Feature: [Your description]"
git push origin main
```

The entire pipeline runs automatically:
- Tests validate code quality
- Security scans check for vulnerabilities  
- Docker image builds
- Image pushes to ACR
- Ansible deploys to production
- Certificate auto-renews if needed
- Application updates live

**No manual deployment commands required!** ✅

---

For setup details, see:
- [GITHUB_RUNNER_SETUP.md](GITHUB_RUNNER_SETUP.md) — Self-hosted runner configuration
- [terraform/README.md](../terraform/README.md) — Infrastructure configuration
- [ansible/README.md](../ansible/README.md) — Ansible playbook documentation
- [docs/QUICKSTART.md](QUICKSTART.md) — Quick reference guide
