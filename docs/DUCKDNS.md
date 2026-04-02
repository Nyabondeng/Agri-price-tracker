# DuckDNS Configuration Guide

DuckDNS is a free dynamic DNS service that points your domain to your public IP address. This guide explains how to configure `agri-price-tracker.duckdns.org` to point to your Azure Bastion Host's public IP.

## Overview

With DuckDNS, your application becomes accessible at:
- **HTTP**: `http://agri-price-tracker.duckdns.org/`
- **HTTPS**: `https://agri-price-tracker.duckdns.org/` (with SSL certificate)

## Prerequisites

1. DuckDNS account and token (from [duckdns.org](https://www.duckdns.org))
2. Azure Bastion Host public IP (from Terraform output: `bastion_host_ip`)
3. Terminal/command line access

## Step 1: Get Your DuckDNS Token

1. Go to [duckdns.org](https://www.duckdns.org)
2. Click on your domain (`agri-price-tracker`)
3. Copy the **token** (long alphanumeric string)
4. Save this securely (needed for updates)

## Step 2: Get Your Bastion Host IP

```bash
cd terraform
terraform output bastion_host_ip

# Output:
# bastion_host_ip = "52.123.456.789"
```

Save this IP address.

## Step 3: Update DuckDNS with Your IP

### Option 1: Using Web Browser (One-time)

1. Go to DuckDNS website: `https://www.duckdns.org`
2. Click your domain (`agri-price-tracker`)
3. In the "IP" field, paste your Bastion Host IP: `52.123.456.789`
4. Click **Update IP**
5. Status should show "Success" (DNS takes 5-30 minutes to update globally)

### Option 2: Using curl (Scripted, Recommended)

```bash
# Update DuckDNS via API (replace values)
DOMAIN="agri-price-tracker"
TOKEN="your-duckdns-token-here"
IP="52.123.456.789"  # Your Bastion Host IP

curl "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${IP}"

# Expected response:
# OK
```

### Option 3: Using PowerShell (Windows)

```powershell
$domain = "agri-price-tracker"
$token = "your-duckdns-token-here"
$ip = "52.123.456.789"

$url = "https://www.duckdns.org/update?domains=$domain&token=$token&ip=$ip"
Invoke-WebRequest -Uri $url

# Shows status OK if successful
```

## Step 4: Verify DNS Resolution

Wait 5-30 minutes for DNS propagation, then test:

```bash
# Using nslookup (Windows Command Prompt)
nslookup agri-price-tracker.duckdns.org

# Output should show your Bastion IP:
# Server: 8.8.8.8
# Address: 8.8.8.8
# 
# Name: agri-price-tracker.duckdns.org
# Address: 52.123.456.789
```

```bash
# Using dig (macOS/Linux)
dig agri-price-tracker.duckdns.org

# Output shows your IP in ANSWER SECTION
```

```bash
# Using ping
ping agri-price-tracker.duckdns.org

# Should show your Bastion IP
```

## Step 5: Set Up Automatic IP Updates (Optional but Recommended)

When your Bastion IP changes, you need to update DuckDNS. Use a scheduled task:

### Windows Task Scheduler

1. Create a batch file (e.g., `update-duckdns.bat`):
```batch
@echo off
set DOMAIN=agri-price-tracker
set TOKEN=your-duckdns-token-here
set IP=52.123.456.789

REM Use curl to update DuckDNS
curl "https://www.duckdns.org/update?domains=%DOMAIN%&token=%TOKEN%&ip=%IP%"

REM Or if curl not available, use PowerShell:
PowerShell -Command "Invoke-WebRequest -Uri 'https://www.duckdns.org/update?domains=%DOMAIN%&token=%TOKEN%&ip=%IP%'"
```

2. Open Task Scheduler:
   - Click Start → Task Scheduler
   - Click Create Basic Task
   - Name: "Update DuckDNS IP"
   - Trigger: On a schedule (daily at 6 AM)
   - Action: Start a program → Browse to batch file

### macOS/Linux Cron Job

```bash
# Edit crontab:
crontab -e

# Add line to run every 6 hours:
0 */6 * * * curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=your-token&ip=$(curl -s https://api.ipify.org)"

# This automatically gets your current IP and updates DuckDNS
```

### Using DuckDNS Client (Official)

DuckDNS provides official clients for various platforms:

1. Go to [duckdns.org/install.jsp](https://www.duckdns.org/install.jsp)
2. Select your operating system (Windows, Raspberry Pi, docker, etc.)
3. Follow installation instructions
4. Client will auto-update your IP periodically

## Step 6: Test Application Access

Once DNS is updated:

1. Open browser
2. Go to: `http://agri-price-tracker.duckdns.org/`
3. You should see your Agri Price Tracker application

**Note**: Bastion Host itself doesn't run a web server. For this to work with your app:
- You need port forwarding from Bastion to your Application VM (not currently configured)
- Or expose HTTP/HTTPS through App VM's public interface (if enabled)
- Or use a Load Balancer in front of the VM

See the "Advanced: Web Access Configuration" section below.

## Advanced: Web Access Configuration

### Option A: Port Forwarding via Bastion

You can use Bastion to forward traffic:

```bash
# SSH tunnel from your local machine through Bastion to App VM
ssh -i ssh-key-agric-price-tracker.pem \
    -o ProxyCommand="ssh -i ssh-key-agric-price-tracker.pem -W %h:%p azureuser@<BASTION_IP>" \
    -L 8080:localhost:3000 \
    azureuser@<APP_VM_PRIVATE_IP>

# Now access locally at: http://localhost:8080/
```

### Option B: Load Balancer in Front of App VM

Update Terraform to add an Azure Load Balancer:

```hcl
# Add to main.tf:
resource "azurerm_public_ip" "app_lb" {
  name = "pip-app-lb"
  location = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method = "Static"
}

resource "azurerm_lb" "app" {
  name = "lb-app"
  location = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku = "Standard"
  depends_on = [azurerm_public_ip.app_lb]

  frontend_ip_configuration {
    name = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.app_lb.id
  }
}

# Then update DuckDNS with Load Balancer IP:
terraform output app_lb_public_ip
```

### Option C: Update NSG to Allow Public Traffic to App VM

If you want to expose the App VM directly (less secure):

```hcl
# Edit NSG rule in main.tf:
security_rule {
  name = "AllowHTTPFromInternet"
  priority = 100
  direction = "Inbound"
  access = "Allow"
  protocol = "Tcp"
  source_port_range = "*"
  destination_port_range = "80"
  source_address_prefix = "0.0.0.0/0"
  destination_address_prefix = "*"
}
```

Then update DuckDNS with App VM's public IP (if assigned):

```bash
terraform output app_vm_public_ip_address
```

## Troubleshooting

### Issue: "DNS name not found"

**Symptoms**:
```
agri-price-tracker.duckdns.org not found
```

**Solutions**:
1. Wait longer for DNS propagation (up to 30 minutes)
2. Flush local DNS cache:
   - Windows: `ipconfig /flushdns`
   - macOS: `dscacheutil -flushcache`
   - Linux: `systemctl restart systemd-resolved`
3. Use different DNS server: `nslookup agri-price-tracker.duckdns.org 8.8.8.8`

### Issue: "Connection refused"

**Symptoms**:
```
ERR_CONNECTION_REFUSED on agri-price-tracker.duckdns.org
```

**Solutions**:
1. Verify Bastion IP is correct:
   ```bash
   curl -I http://52.123.456.789/
   ```
2. Verify DuckDNS points to correct IP:
   ```bash
   nslookup agri-price-tracker.duckdns.org
   ```
3. Bastion Host doesn't run a web server—need Load Balancer or port forwarding
4. Check Azure NSG allows HTTP/HTTPS from internet

### Issue: "Cannot reach Bastion IP"

**Symptoms**:
```
Timeout: No route to 52.123.456.789
```

**Solutions**:
1. Verify IP is public (starts with public IP range, not 10.x.x.x)
2. Verify Azure NSG allows your IP on port 22
3. Verify Bastion Host is running:
   ```bash
   az bastion show --resource-group <rg> --name <bastion-name>
   ```

### Issue: "Token invalid"

**Symptoms**:
```
KO on curl response
```

**Solutions**:
1. Verify you copied the token correctly (no spaces)
2. Verify token hasn't expired (regenerate from DuckDNS site)
3. Try via web browser first to confirm token works

## Dynamic IP Handling

DuckDNS is designed for dynamic IPs. If your Bastion IP changes:

1. Get new IP:
   ```bash
   terraform refresh
   terraform output bastion_host_ip
   ```

2. Update DuckDNS:
   ```bash
   curl "https://www.duckdns.org/update?domains=agri-price-tracker&token=<token>&ip=<new-ip>"
   ```

3. Wait for DNS propagation (5-30 minutes)

With automatic updates (cron/Task Scheduler), this happens without intervention.

## Securing with HTTPS

For production, use HTTPS with Let's Encrypt:

1. On your Application VM, install Certbot:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Get certificate:
   ```bash
   sudo certbot certonly --manual --preferred-challenges dns -d agri-price-tracker.duckdns.org
   ```

3. Configure your web server to use the certificate

4. Update Ansible playbook to serve HTTPS

5. Update DuckDNS to use HTTPS records (if available)

## References

- [DuckDNS Official Site](https://www.duckdns.org)
- [DuckDNS API Documentation](https://www.duckdns.org/spec.jsp)
- [DuckDNS Clients](https://www.duckdns.org/install.jsp)
- [Azure Bastion Documentation](https://learn.microsoft.com/en-us/azure/bastion/)

## Summary

1. Get Bastion IP from Terraform
2. Update DuckDNS with your IP
3. Verify DNS resolution
4. Wait for global propagation (5-30 min)
5. Access your app via domain
6. (Optional) Set up automatic IP updates

---

**Last Updated**: 2026-03-31  
**Current Domain**: agri-price-tracker.duckdns.org  
**Support**: See DuckDNS support forum or GitHub issues
