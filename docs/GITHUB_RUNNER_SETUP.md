# GitHub Self-Hosted Runner Setup

## Overview

This document explains how to set up a **self-hosted GitHub Actions runner** on your Azure Bastion Host. This enables automated CI/CD deployments to your private Azure infrastructure.

**Why Self-Hosted Runner?**
- GitHub-hosted runners run in public cloud (can't reach private Azure VMs)
- Self-hosted runner runs on your infrastructure (has network access to private VMs)
- Allows Ansible playbook to automatically deploy to App VM without manual steps

---

## Prerequisites

- Bastion Host created by Terraform (should be running)
- SSH access to Bastion Host
- Your GitHub repository URL
- GitHub Actions runner token (generated below)

---

## Step 1: Generate GitHub Runner Token

1. Go to **https://github.com/YOUR_USERNAME/Agri-price-tracker**
2. Click **Settings** → **Actions** → **Runners** (in left sidebar)
3. Click **New self-hosted runner** (green button)
4. **Configuration** page appears with a token - copy the entire `TOKEN` value
   - Example: `ABCDEFGHIJKLMNOPabcdefghij1234567890`
5. Keep this token safe - it's used to register the runner

---

## Step 2: SSH to Bastion Host

From your local machine:

```powershell
# PowerShell
$BASTION_IP = "YOUR_BASTION_IP"  # From Terraform outputs
$KEY_PATH = "terraform/ssh-key-agric-price-tracker.pem"

ssh -i $KEY_PATH azureuser@$BASTION_IP
```

Or on macOS/Linux:

```bash
ssh -i terraform/ssh-key-agric-price-tracker.pem azureuser@YOUR_BASTION_IP
```

---

## Step 3: Download and Run Installation Script

On the Bastion Host, run:

```bash
# Create scripts directory
mkdir -p ~/scripts
cd ~/scripts

# Download the installation script
curl -o install-github-runner.sh https://raw.githubusercontent.com/YOUR_USERNAME/Agri-price-tracker/main/scripts/install-github-runner.sh
chmod +x install-github-runner.sh

# Run the installer with your token
./install-github-runner.sh \
  "https://github.com/YOUR_USERNAME/Agri-price-tracker" \
  "YOUR_GITHUB_TOKEN"
```

**Replace:**
- `YOUR_USERNAME` - Your GitHub username
- `YOUR_GITHUB_TOKEN` - The token from Step 1

---

## Step 4: Verify Runner Installation

The script will:
1. ✅ Download GitHub Actions runner
2. ✅ Configure it with your repository
3. ✅ Install as systemd service
4. ✅ Start the service

Check if the runner is running:

```bash
# On Bastion
systemctl status actions.runner.* 

# You should see: Active (running)
```

---

## Step 5: Verify Runner Registration

In GitHub:

1. Go to **Settings → Actions → Runners**
2. You should see **"Bastion-Runner-1"** in the list
3. Status should show as **✓ Online** (green dot)

If it shows "Offline", check the logs:

```bash
# On Bastion
sudo journalctl -u actions.runner.* -n 50 -f
```

---

## Step 6: Trigger Automated Deployment

Now that the self-hosted runner is ready:

1. Push a commit to your repo:
   ```bash
   git commit --allow-empty -m "Trigger automated deployment with self-hosted runner"
   git push
   ```

2. Go to **GitHub → Actions → deploy-production**
3. The workflow will now:
   - ✅ Run on self-hosted runner (not GitHub-hosted)
   - ✅ Build Docker image
   - ✅ Push to Azure Container Registry
   - ✅ Run Ansible playbook to deploy to App VM
   - ✅ Install Nginx reverse proxy
   - ✅ Install Docker and run application

Watch the workflow logs - it should now complete successfully!

---

## Troubleshooting

### Runner appears "Offline"

**Check service status:**
```bash
systemctl status actions.runner.*
sudo journalctl -u actions.runner.* -n 100 -f
```

**Check runner logs:**
```bash
cd /opt/github-actions-runner
tail -100 _diag/Runner_*.log
```

### Runner service won't start

```bash
# Reinstall service
cd /opt/github-actions-runner
sudo ./svc.sh uninstall
sudo ./svc.sh install
sudo ./svc.sh start
```

### Can't reach App VM from runner

**Verify network connectivity:**
```bash
# On Bastion (where runner is)
# Check if you can reach App VM's private IP
ping 10.0.2.4  # or your App VM's private IP

# Check SSH
ssh -i ~/.ssh/id_rsa azureuser@10.0.2.4
```

If connectivity fails:
- Check Azure NSG rules allow traffic from Bastion subnet to App subnet
- Verify App VM is running in Azure Portal

### Workflow still skips Ansible deploy

Check the workflow logs for:
- `CAN_DEPLOY=true` (should be set)
- SSH connectivity check passes

If SSH check fails, verify:
1. SSH key exists on runner: `/opt/github-actions-runner/_work/..../`
2. App VM private IP is correct in GitHub Secrets
3. Bastion IP is correct in GitHub Secrets

---

## Maintenance

### View runner logs in real-time
```bash
sudo journalctl -u actions.runner.* -f
```

### Stop the runner (temporarily)
```bash
sudo systemctl stop actions.runner.*
```

### Start the runner (resume operation)
```bash
sudo systemctl start actions.runner.*
```

### Deregister and remove runner
```bash
cd /opt/github-actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token YOUR_TOKEN
```

---

## Workflow After Setup

Once runner is online:

```
Git Commit
    ↓
GitHub Actions Triggered
    ↓
Self-Hosted Runner (on Bastion)
    ├─ Lint & Test
    ├─ Build Docker Image
    ├─ Push to ACR
    └─ Run Ansible
        └─ SSH to App VM
        └─ Install Nginx
        └─ Pull Docker Image
        └─ Start Container
    ↓
Application Live at https://agri-price-tracker.duckdns.org/
```

---

## See Also

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-Hosted Runner Documentation](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners)
- [Ansible Deployment Documentation](../ansible/README.md)
- [Terraform Documentation](../terraform/README.md)
