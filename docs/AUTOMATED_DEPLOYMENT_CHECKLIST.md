# Automated CI/CD Deployment - Quick Setup Checklist

## Current Status

✅ **Infrastructure**: Terraform deployment configured & infrastructure created in Azure
✅ **CI Pipeline**: GitHub Actions CI workflow running (lint, test, security scans)
✅ **Docker**: Build & push to Azure Container Registry working
✅ **Ansible**: Playbook configured with Nginx + Let's Encrypt

❌ **Blocker**: Ansible deploy skipped because GitHub-hosted runners can't reach private VMs

---

## Solution: Self-Hosted GitHub Runner

To enable **fully automated Git-to-Production deployment**, we need to:

1. Set up a self-hosted GitHub Actions runner on your **Bastion Host** (has network access)
2. Update CD workflow to use the self-hosted runner
3. Push trigger commit to start automated deployment

---

## Step-by-Step Setup

### ✅ Step 1: Get GitHub Runner Token (5 minutes)

- [ ] Go to: **GitHub Repo → Settings → Actions → Runners**
- [ ] Click **"New self-hosted runner"**
- [ ] Copy the **TOKEN** (long string like `ABCDEFGHIJKLMNOpqrst1234567890`)
- [ ] Keep it safe - you'll use it in Step 3

### ✅ Step 2: SSH to Bastion Host (5 minutes)

From your local machine:

```powershell
# PowerShell
$BASTION_IP = "your-bastion-ip"  # From HCP Terraform outputs
ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@$BASTION_IP
```

- [ ] Verify you're connected to Bastion

### ✅ Step 3: Install Runner (5 minutes)

On the Bastion Host, run:

```bash
# Download installation script
curl -o ~/install-github-runner.sh \
  https://raw.githubusercontent.com/YOUR_USERNAME/Agri-price-tracker/main/scripts/install-github-runner.sh
chmod +x ~/install-github-runner.sh

# Run installer (replace values)
~/install-github-runner.sh \
  "https://github.com/YOUR_USERNAME/Agri-price-tracker" \
  "YOUR_GITHUB_TOKEN_FROM_STEP_1"
```

- [ ] Wait for script to complete
- [ ] Verify output shows "✅ Runner Installation Complete!"

### ✅ Step 4: Verify Runner Online (2 minutes)

Back in GitHub:

- [ ] Go to **Settings → Actions → Runners**
- [ ] Look for **"Bastion-Runner-1"** 
- [ ] Verify status shows **✓ Online** (green dot)

### ✅ Step 5: Trigger Automated Deployment (2 minutes)

From your local machine:

```bash
cd Agri-price-tracker
git commit --allow-empty -m "Trigger automated deployment with self-hosted runner"
git push
```

- [ ] Go to **GitHub → Actions → deploy-production** (latest run)
- [ ] Watch the workflow execute

---

## What Should Happen in the Workflow

Once self-hosted runner is online and you push:

```
Step 1: Checkout code ✅
Step 2: Lint & Test ✅
Step 3: Build Docker image ✅
Step 4: Scan with Trivy ✅
Step 5: Push to ACR ✅
Step 6: Install Ansible & Python ✅
Step 7: Generate SSH config ✅
Step 8: Check SSH reachability ✅
Step 9: Run Ansible playbook ✅ (This will now WORK!)
  └─ Update apt cache
  └─ Install Nginx
  └─ Configure Nginx reverse proxy
  └─ Install Certbot & Let's Encrypt support
  └─ Create cron for cert renewal
  └─ Install Docker
  └─ Login to ACR
  └─ Pull Docker image
  └─ Run application container
Step 10: Verify deployment ✅
```

---

## After Deployment

Once the workflow completes successfully:

### 1. Setup HTTPS/SSL Certificate

SSH to App VM and request certificate:

```bash
# SSH through Bastion
ssh -i terraform/ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i terraform/ssh-key-agric-price-tracker.pem -W %h:%p azureuser@BASTION_IP" \
    azureuser@APP_IP

# On App VM:
sudo certbot certonly --nginx \
  -d agri-price-tracker.duckdns.org \
  --email your-email@example.com \
  --non-interactive \
  --agree-tos

# Verify HTTPS
curl -I https://agri-price-tracker.duckdns.org/
```

- [ ] Certificate installed
- [ ] HTTPS working

### 2. Verify Live Application

- [ ] Open browser: https://agri-price-tracker.duckdns.org/
- [ ] Application should be visible and functional

### 3. Test Full CI/CD Pipeline

- [ ] Make a code change
- [ ] Push to GitHub
- [ ] Workflow runs automatically
- [ ] Changes live within 2-3 minutes

---

## Troubleshooting

### Runner appears "Offline" in GitHub

On Bastion:
```bash
sudo systemctl status actions.runner.*
sudo journalctl -u actions.runner.* -n 50 -f
```

### Workflow still shows "Skipping Ansible deploy"

Check:
- [ ] Runner status is "Online" in GitHub
- [ ] CAN_DEPLOY is set to "true" in logs
- [ ] SSH connectivity check passes

### Can't SSH to Bastion

- [ ] Verify Bastion IP is correct
- [ ] Verify SSH key path is correct
- [ ] Check Azure NSG allows SSH (port 22) from your IP

---

## Timeline

- ⏱️ **5 min**: Get GitHub token
- ⏱️ **5 min**: SSH to Bastion
- ⏱️ **5 min**: Install runner
- ⏱️ **2 min**: Verify online
- ⏱️ **3-5 min**: Workflow runs
- ⏱️ **5 min**: Setup HTTPS
- ⏱️ **30 min total** to go live!

---

## Files Updated

- `.github/workflows/cd.yml` — Updated to use self-hosted runner
- `scripts/install-github-runner.sh` — NEW runner installation script
- `docs/GITHUB_RUNNER_SETUP.md` — Full documentation

## Next Steps

1. ✅ Commit these changes: `git add . && git commit -m "Add self-hosted runner setup for automated CI/CD" && git push`
2. ✅ Follow the checklist above
3. ✅ Verify runner is online on GitHub
4. ✅ Push trigger commit
5. ✅ Watch workflow auto-deploy your app!

---

For detailed documentation, see [GITHUB_RUNNER_SETUP.md](GITHUB_RUNNER_SETUP.md)
