# Deployment Testing Checklist

This document provides a comprehensive testing plan to verify the entire Git-to-Production workflow before submission.

## Pre-Deployment Setup

### Checklist: Infrastructure Prerequisites

- [ ] Azure account created and verified
- [ ] Service Principal or Azure CLI authentication configured
- [ ] Terraform installed locally (`terraform --version`)
- [ ] Ansible installed locally (`ansible --version`)
- [ ] SSH client available (Windows 10+, macOS, Linux)
- [ ] Docker Desktop installed (for local testing)
- [ ] Git configured with SSH keys (`git config --list`)

### Checklist: Repository State

- [ ] Code pushed to GitHub main branch
- [ ] All uncommitted changes stashed: `git status` shows clean
- [ ] Latest changes pulled: `git pull origin main`
- [ ] README.md has been updated with setup instructions
- [ ] Dockerfile verified and buildable locally
- [ ] docker-compose.yml configured correctly
- [ ] .gitignore includes terraform.tfstate and SSH keys

### Checklist: GitHub Repository Setup

- [ ] Repository visibility is public (for live URL access)
- [ ] Branch protection enabled on main branch
- [ ] CI pipeline (ci.yml) is configured and tested
- [ ] CD pipeline (cd.yml) is configured and tested
- [ ] Branch protection requires status checks pass
- [ ] Stale workflows removed or archived

## Test Phase 1: Infrastructure Deployment

### Test 1.1: Terraform Syntax Validation

```bash
cd terraform

# Check syntax
terraform fmt -check -recursive
# Expected: Returns 0 (no formatting issues)

# Validate configuration
terraform validate
# Expected: "Validation successful"
```

**Acceptance Criteria**:
- [ ] `terraform fmt -check -recursive` returns 0
- [ ] `terraform validate` shows "Validation successful"
- [ ] No warnings or errors in output

### Test 1.2: Terraform Plan

```bash
terraform plan -out=tfplan \
  -var="db_username=admin" \
  -var="db_password=SecurePassword123!"

# Review the plan output
```

**Acceptance Criteria**:
- [ ] Shows "Plan: X added, 0 changed, 0 destroyed" (typically 17-20 resources)
- [ ] No errors in plan output
- [ ] Plan saved to `tfplan` file
- [ ] All resources have correct configuration

**Expected Resources**:
```
+ azurerm_resource_group
+ azurerm_virtual_network
+ azurerm_subnet (3x: bastion, private, database)
+ azurerm_public_ip (2x: bastion, app lb)
+ azurerm_bastion_host
+ azurerm_linux_virtual_machine
+ azurerm_container_registry
+ azurerm_postgresql_flexible_server
+ azurerm_network_security_group (2x: app, database)
+ azurerm_network_interface
+ azurerm_private_dns_zone
+ azurerm_private_dns_zone_virtual_network_link
+ azurerm_ssh_public_key
+ tls_private_key
+ local_file (SSH key)
```

### Test 1.3: Terraform Apply

```bash
# Apply the plan
terraform apply tfplan

# Duration: 5-10 minutes
# Monitor on Azure Portal while applying
```

**Acceptance Criteria**:
- [ ] All resources created successfully
- [ ] No errors or failed resources
- [ ] Terraform state file created (`terraform.tfstate`)
- [ ] All outputs displayed at end of apply

**Terraform Outputs**:
```
bastion_host_ip = "52.xxx.xxx.xxx"
app_vm_private_ip = "10.0.2.x"
acr_login_server = "acr*.azurecr.io"
database_fqdn = "psql-*.postgres.database.azure.com"
```

### Test 1.4: Azure Portal Verification

In Azure Portal, verify all resources created:

```
Resource Group: rg-agric-price-tracker-*
  └─ Virtual Network
     ├─ Public Subnet (Bastion)
     ├─ Private Subnet (App VM)
     └─ Database Subnet (PostgreSQL)
  └─ Bastion Host
     └─ Public IP: 52.xxx.xxx.xxx
  └─ Virtual Machine (App)
     └─ Private IP: 10.0.2.x
  └─ PostgreSQL Database
  └─ Container Registry
  └─ Network Security Groups (2x)
```

**Acceptance Criteria**:
- [ ] All resources visible in Azure Portal
- [ ] Bastion Host status: "Provisioned" (green checkmark)
- [ ] Virtual Machine status: "Running" (green checkmark)
- [ ] PostgreSQL status: "Available" (green checkmark)
- [ ] Container Registry status: "Healthy"

### Test 1.5: SSH Connectivity

Test SSH access through Bastion:

```bash
# SSH into Bastion
BASTION_IP=$(terraform output -raw bastion_host_ip)
ssh -i ssh-key-agric-price-tracker.pem azureuser@$BASTION_IP

# You should be connected to Bastion
azureuser@vm-app-xxxxx:~$ exit
```

**Acceptance Criteria**:
- [ ] SSH connection successful
- [ ] Command prompt appears: `azureuser@...`
- [ ] Can type commands
- [ ] Exit command closes connection

### Test 1.6: PostgreSQL Connectivity

Test database connection:

```bash
# From Bastion, connect to database
PGHOST=$(terraform output -raw database_fqdn)
PGUSER="postgres_admin"
PGPASSWORD="SecurePassword123!"

psql -h $PGHOST -U $PGUSER -d postgres -c "SELECT version();"

# You should see database version
```

**Acceptance Criteria**:
- [ ] PostgreSQL connection successful
- [ ] Database version displayed
- [ ] Can create test table
- [ ] Can read/write data

### Test 1.7: Terraform Destroy

Test cleanup (run before moving forward):

```bash
# Destroy infrastructure
terraform destroy

# Type 'yes' when prompted
# Duration: 5-10 minutes
```

**Acceptance Criteria**:
- [ ] All resources destroyed successfully
- [ ] No "orphaned" resources left in Azure Portal
- [ ] State file shows no resources: `terraform state list` (empty)
- [ ] Azure Portal shows empty/deleted resources

## Test Phase 2: Fresh Infrastructure Rebuild

Rebuild everything to verify idempotency:

### Test 2.1: Re-apply Terraform

```bash
# Verify state is clean
terraform state list | wc -l
# Expected: 0 resources

# Re-apply from scratch
terraform apply -auto-approve \
  -var="db_username=admin" \
  -var="db_password=SecurePassword123!"
```

**Acceptance Criteria**:
- [ ] All resources created again successfully
- [ ] Same resource counts as Test 1.3
- [ ] No terraform errors
- [ ] Duration similar to first apply (5-10 min)

### Test 2.2: Ansible Configuration

Test VM configuration with Ansible:

```bash
# Configure inventory
APP_VM_IP=$(terraform output -raw app_vm_private_ip)
BASTION_IP=$(terraform output -raw bastion_host_ip)

cd ../ansible

cat > inventory.ini <<EOF
[app]
app_vm ansible_host=$APP_VM_IP \
       ansible_user=azureuser \
       ansible_ssh_private_key_file=~/.ssh/ssh-key-agric-price-tracker.pem \
       ansible_ssh_common_args='-o ProxyJump=azureuser@$BASTION_IP'

[app:vars]
ansible_python_interpreter=/usr/bin/python3
EOF

# Test connectivity
ansible all -i inventory.ini -m ping
# Expected: SUCCESS

# Dry-run playbook
ansible-playbook -i inventory.ini deploy.yml --check

# Run playbook (actually deploy)
ansible-playbook -i inventory.ini deploy.yml
```

**Acceptance Criteria**:
- [ ] Ansible ping succeeds
- [ ] Dry-run shows all tasks
- [ ] Playbook run succeeds without errors
- [ ] Docker is installed: `docker --version`
- [ ] Container created and running

## Test Phase 3: CI Pipeline Testing

### Test 3.1: CI on Pull Request

```bash
# Create test branch
git checkout -b test/ci-validation
echo "# Test Comment" >> README.md
git add README.md
git commit -m "test: trigger CI pipeline"
git push origin test/ci-validation

# Create Pull Request on GitHub
# Go to GitHub → Click "Create Pull Request"
```

**On GitHub**:
1. Create PR from `test/ci-validation` → `main`
2. Monitor Actions tab

**Acceptance Criteria**:
- [ ] CI workflow triggered automatically (check Actions tab)
- [ ] All jobs run: lint, test, build, scan
- [ ] Linting passes (0 errors)
- [ ] Tests pass (if any)
- [ ] Docker image builds successfully
- [ ] Trivy scan completes (shows vulnerabilities, doesn't fail if not CRITICAL)
- [ ] tfsec scan completes (shows issues, doesn't fail if not CRITICAL)
- [ ] PR shows "All checks passed" (green checkmark)
- [ ] Merge button is enabled

### Test 3.2: CI on Direct Commit (Non-main)

```bash
# Make another change
echo "// Test change" >> src/server.js
git add src/server.js
git commit -m "test: direct commit"
git push origin test/ci-validation
```

**Acceptance Criteria**:
- [ ] CI reruns automatically
- [ ] All checks still pass
- [ ] No merge required yet

### Test 3.3: CI Status Requirements

In GitHub Settings:

```
Settings → Branches → main → Branch protection rules
  ├─ Require status checks to pass
  ├─ Status checks:
  │   ├─ build-test-lint (from CI workflow)
  │   └─ (others if configured)
  └─ [✓] Dismiss stale PR approvals
```

**Acceptance Criteria**:
- [ ] Status checks are required
- [ ] CI pipeline listed in required checks
- [ ] Cannot merge without passing checks

## Test Phase 4: CD Pipeline Testing

### Test 4.1: Configure GitHub Secrets

Before CD test, configure secrets:

```bash
# Get values from Terraform
ACR_LOGIN=$(terraform output -raw acr_login_server)
BASTION=$(terraform output -raw bastion_host_ip)
APP_IP=$(terraform output -raw app_vm_private_ip)

# SSH Key
cat terraform/ssh-key-agric-price-tracker.pem

# Get ACR credentials
az acr credential show --name acragricpricetrickeravloqy

# In GitHub Settings → Secrets and variables → Actions:
# Add:
# - ACR_LOGIN_SERVER: $ACR_LOGIN
# - ACR_USERNAME: <from az acr command>
# - ACR_PASSWORD: <from az acr command>
# - BASTION_HOST: $BASTION
# - APP_PRIVATE_IP: $APP_IP
# - SSH_PRIVATE_KEY: <from file>
```

**Acceptance Criteria**:
- [ ] All 6 secrets created in GitHub
- [ ] Secrets are masked in logs
- [ ] Secret names match workflow variable names exactly

### Test 4.2: Merge PR to Trigger CD

```bash
# Go to GitHub PR
# Click "Approve" (if review required)
# Click "Merge pull request"
# Click "Confirm merge"
```

**Acceptance Criteria**:
- [ ] PR merged to main
- [ ] CD workflow triggers automatically (check Actions tab)
- [ ] Branch can be deleted (optional)

### Test 4.3: Monitor CD Workflow

In GitHub Actions, monitor the deployment:

```
CD Pipeline Job:
1. Checkout code ✓
2. Setup Node.js ✓
3. Install dependencies ✓
4. Run lint ✓
5. Run tests ✓
6. Build Docker image ✓
7. Scan with Trivy ✓
8. Scan with tfsec ✓
9. Validate secrets ✓
10. Normalize ACR variables ✓
11. Login to ACR ✓
12. Tag image ✓
13. Push to ACR ✓
14. Setup Python for Ansible ✓
15. Install Ansible ✓
16. Prepare SSH key ✓
17. Generate inventory ✓
18. Check SSH reachability ✓
19. Deploy with Ansible ✓
20. Cleanup ✓
```

**Acceptance Criteria**:
- [ ] All 20+ steps complete without errors
- [ ] Each step shows appropriate output
- [ ] No secrets displayed in logs (shows ***)
- [ ] Final status: "completed successfully"

### Test 4.4: Verify Application Deployed

Once CD completes:

```bash
# SSH into app VM through bastion
BASTION=$(terraform output -raw bastion_host_ip)
APP_IP=$(terraform output -raw app_vm_private_ip)

ssh -i ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i ssh-key-agric-price-tracker.pem -W %h:%p azureuser@$BASTION" \
    azureuser@$APP_IP

# On VM, check Docker
docker ps
# Should show: agric-price-tracker-app container running

# Check application
curl http://localhost:3000/
# Should show HTML response

# Check API
curl http://localhost:3000/api/prices
# Should show JSON data

exit  # Exit SSH session
```

**Acceptance Criteria**:
- [ ] SSH connection successful through Bastion
- [ ] `docker ps` shows running container
- [ ] Application responds to curl
- [ ] API endpoint returns JSON
- [ ] No error messages

## Test Phase 5: DNS and Public Access

### Test 5.1: Configure DuckDNS

```bash
# Get Bastion IP
BASTION=$(terraform output -raw bastion_host_ip)

# Update DuckDNS (via browser or curl)
curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=YOUR_TOKEN&ip=$BASTION"

# Response should be: OK
```

**Acceptance Criteria**:
- [ ] DuckDNS API returns OK
- [ ] Domain shows "Activated"

### Test 5.2: Wait for DNS Propagation

```bash
# Wait 5-30 minutes, then verify DNS
nslookup agri-price-tracker.duckdns.org

# Should show:
# Name: agri-price-tracker.duckdns.org
# Address: 52.xxx.xxx.xxx
```

**Acceptance Criteria**:
- [ ] DNS resolves to Bastion IP
- [ ] Works from multiple terminals
- [ ] Works from different network (phone hotspot, etc.)

### Test 5.3: Public Application Access (Optional)

If Load Balancer configured:

```bash
# Try accessing via domain
curl http://agri-price-tracker.duckdns.org/

# Or in browser:
# http://agri-price-tracker.duckdns.org/
```

**Acceptance Criteria**:
- [ ] Application accessible via domain
- [ ] HTML response received
- [ ] API endpoints work
- [ ] Application branded correctly

## Test Phase 6: End-to-End Git Flow

This is the critical demo test:

### Test 6.1: Make Visible Code Change

```bash
# Create new branch
git checkout -b demo/visible-change

# Make visible change (e.g., dashboard text)
# Edit: agriprice-ghana/frontend/src/pages/DashboardPage.jsx
# Change: "View fresh prices" → "See Today's Market Prices"

git add .
git commit -m "feat: update dashboard greeting text"
git push origin demo/visible-change
```

### Test 6.2: Create and Monitor PR

On GitHub:
1. Create PR from `demo/visible-change` → `main`
2. Watch CI pipeline run
3. Review CI output (lint, tests, security scans pass)

**Acceptance Criteria**:
- [ ] PR created successfully
- [ ] CI workflow triggered
- [ ] All security scans pass
- [ ] No CRITICAL vulnerabilities
- [ ] PR shows "All checks passed"

### Test 6.3: Merge PR

1. Click "Approve" (if required)
2. Click "Merge pull request"
3. Confirm merge

### Test 6.4: Monitor CD Deployment

In GitHub Actions:
1. Watch CD workflow start
2. Monitor Docker build and push
3. Monitor Ansible deployment

**Acceptance Criteria**:
- [ ] CD workflow triggered when code merged to main
- [ ] All steps complete without error
- [ ] Image pushed to ACR
- [ ] Ansible playbook ran
- [ ] Application updated

### Test 6.5: Verify Change in Live Application

```bash
# If Load Balancer/public access configured:
curl http://agri-price-tracker.duckdns.org/

# Should show updated text: "See Today's Market Prices"

# Or via SSH (always works):
ssh -i ... azureuser@$APP_VM \
  && curl http://localhost:3000/ \
  && grep "See Today's Market Prices"
```

**Acceptance Criteria**:
- [ ] Change is visible in application
- [ ] Change appeared without manual deployment
- [ ] Complete Git-to-Production flow verified

## Test Phase 7: Cleanup and Final Verification

### Test 7.1: Test Destruction

```bash
cd terraform

# Destroy all infrastructure
terraform destroy

# Confirm destruction
```

**Acceptance Criteria**:
- [ ] All resources destroyed successfully
- [ ] No errors during destroy
- [ ] Azure Portal shows no resources
- [ ] No orphaned resources (check all resource groups)

### Test 7.2: Verify Cleanup

In Azure Portal:
- [ ] Resource group deleted or empty
- [ ] No VMs running
- [ ] No databases
- [ ] No container registry (or empty)
- [ ] No bastion

## Final Verification

###  Documentation Complete

- [ ] README.md updated with live URL (if deployed)
- [ ] README.md has architecture diagram
- [ ] terraform/README.md complete
- [ ] ansible/README.md complete
- [ ] docs/GITHUB_SECRETS.md complete
- [ ] docs/DUCKDNS.md complete
- [ ] All instructions are clear and tested

###  Code Quality

- [ ] npm run lint passes (0 errors)
- [ ] npm test passes (if tests exist)
- [ ] terraform validate passes
- [ ] terraform fmt -check passes
- [ ] eslint-config consistent

###  Security

- [ ] No secrets in .gitignore violations
- [ ] No hardcoded credentials in code
- [ ] .gitignore includes terraform.tfstate
- [ ] .gitignore includes SSH keys
- [ ] GitHub secrets properly configured
- [ ] SSH keys have 0600 permissions

###  Pipelines Working

- [ ] CI workflow triggers on PR
- [ ] CI workflow blocks merge on failures (security scans, lint)
- [ ] CD workflow triggers on main merge only
- [ ] CD pushes to ACR successfully
- [ ] CD runs Ansible playbook
- [ ] Both workflows have clear logs

## Submission Preparation

### Before Final Submission

- [ ] All tests Pass (Phase 1-7)
- [ ] Fresh build and destroy cycle successful
- [ ] Code changes visible in live application
- [ ] Video recorded (10-15 min, shows full Git-to-Prod flow)
- [ ] README.md final, comprehensive, with diagrams
- [ ] No sensitive data in repository
- [ ] All files formatted and committed
- [ ] Repository pushed to GitHub

### Recording Video Demo

1. **Intro (1 min)**:
   - [ ] Show team members
   - [ ] Show application overview
   - [ ] Show architecture diagram

2. **Live App (30 sec)**:
   - [ ] Show application running
   - [ ] Show API endpoint

3. **Code Change (1 min)**:
   - [ ] Make small visible change
   - [ ] Commit with clear message
   - [ ] Push to feature branch

4. **PR & CI (2 min)**:
   - [ ] Create pull request on GitHub
   - [ ] Show CI workflow running
   - [ ] Point out security scans (Trivy, tfsec)
   - [ ] Show PR cannot merge until checks pass
   - [ ] Wait for CI to complete

5. **Merge & CD (2 min)**:
   - [ ] Approve and merge PR
   - [ ] Show CD workflow triggered immediately
   - [ ] Walk through CD steps (build, push, deploy)
   - [ ] Show Ansible playbook execution

6. **Verification (2 min)**:
   - [ ] Refresh live application
   - [ ] Show the change is now live
   - [ ] Demonstrate automatic deployment (no manual steps)

7. **Wrap-up (1 min)**:
   - [ ] Show architecture one more time
   - [ ] Brief summary of pipeline capabilities
   - [ ] Thank you

**Video Requirements**:
- [ ] Total length: 10-15 minutes
- [ ] Clear audio and screen recording
- [ ] Show face in corner window (optional but encouraged)
- [ ] Uploaded to YouTube (unlisted) or Google Drive
- [ ] See proof full Git-to-Production flow
- [ ] Include your face and clear narration

## Approval Checklist

**Before submitting to Canvas**:

- [ ] All tests passed (7 test phases)
- [ ] Infrastructure can be created and destroyed cleanly
- [ ] Git-to-Production flow verified end-to-end
- [ ] Code change visible in live application
- [ ] Video demo recorded and accessible
- [ ] README finalized with diagrams and links
- [ ] All secrets properly configured
- [ ] No sensitive data left in repository
- [ ] Team contributions documented

---

**This checklist must be completed before final submission.**  
**Estimated time: 2-3 hours of testing**  
**Good luck with your deployment!**
