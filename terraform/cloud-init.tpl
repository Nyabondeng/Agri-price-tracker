#!/bin/bash
# Cloud-init script for Agri Price Tracker deployment
# This runs automatically when the VM boots

set -euo pipefail

# Logging
exec > >(tee /var/log/agri-price-tracker-deploy.log)
exec 2>&1
echo "=== Agri Price Tracker Deployment Started at $(date) ==="

# Configuration
export DOCKER_IMAGE="${docker_image}"
export ACR_LOGIN_SERVER="${acr_login_server}"
export ACR_USERNAME="${acr_username}"
export ACR_PASSWORD="${acr_password}"
export DOMAIN_NAME="${domain_name}"
export CERT_EMAIL="${cert_email}"
export APP_PORT="3000"
export NODE_ENV="production"

echo "Configuration:"
echo "  Docker Image: $DOCKER_IMAGE"
echo "  ACR Server: $ACR_LOGIN_SERVER"
echo "  Domain: $DOMAIN_NAME"
echo "  Email: $CERT_EMAIL"

# ============================================================================
# Phase 1: System Updates
# ============================================================================
echo ""
echo "=== Phase 1: System Updates ==="
apt-get update
apt-get upgrade -y
apt-get install -y \
  ca-certificates \
  curl \
  wget \
  gnupg \
  lsb-release \
  software-properties-common \
  python3-pip \
  python3-apt \
  apt-transport-https

# ============================================================================
# Phase 2: Docker Installation
# ============================================================================
echo ""
echo "=== Phase 2: Install Docker ==="
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
systemctl enable docker
systemctl start docker
echo "✓ Docker installed and running"

# ============================================================================
# Phase 3: Nginx Installation
# ============================================================================
echo ""
echo "=== Phase 3: Install Nginx and Certbot ==="
apt-get install -y \
  nginx \
  certbot \
  python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
echo "✓ Nginx installed and running"

# ============================================================================
# Phase 4: Create Certbot Directories
# ============================================================================
echo ""
echo "=== Phase 4: Create Certbot Validation Directory ==="
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot
echo "✓ Certbot validation directory created"

# ============================================================================
# Phase 5: Configure Nginx for HTTP (ACME challenge)
# ============================================================================
echo ""
echo "=== Phase 5: Configure Nginx HTTP ==="
cat > /etc/nginx/sites-available/default <<'NGINX_HTTP'
# Nginx HTTP configuration for Agri Price Tracker
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  # Let's Encrypt ACME challenge validation
  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
    try_files $uri =404;
  }

  # Proxy to localhost:3000
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
NGINX_HTTP

nginx -t && systemctl reload nginx
echo "✓ Nginx HTTP configured"

# ============================================================================
# Phase 6: Docker Login to ACR
# ============================================================================
echo ""
echo "=== Phase 6: Login to Azure Container Registry ==="
if [ -z "$ACR_LOGIN_SERVER" ] || [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
  echo "⚠ ACR credentials not provided. Skipping ACR login."
else
  echo "$ACR_PASSWORD" | docker login -u "$ACR_USERNAME" --password-stdin "$ACR_LOGIN_SERVER"
  echo "✓ Logged in to ACR"
fi

# ============================================================================
# Phase 7: Pull and Run Docker Container
# ============================================================================
echo ""
echo "=== Phase 7: Deploy Application Container ==="
if [ -z "$DOCKER_IMAGE" ] || [ "$DOCKER_IMAGE" = "PLACEHOLDER_DOCKER_IMAGE" ]; then
  echo "⚠ Docker image not specified. Skipping container deployment."
else
  echo "Pulling image: $DOCKER_IMAGE"
  if docker pull "$DOCKER_IMAGE" 2>/dev/null; then
    # Stop and remove old container
    docker stop agric-price-tracker-app 2>/dev/null || true
    docker rm agric-price-tracker-app 2>/dev/null || true
    
    # Run new container
    docker run -d \
      --name agric-price-tracker-app \
      --restart unless-stopped \
      -e NODE_ENV=production \
      -e PORT=3000 \
      -p 3000:3000 \
      "$DOCKER_IMAGE"
    
    echo "✓ Container deployed and running"
    sleep 3
    docker logs agric-price-tracker-app | head -20
  else
    echo "⚠ Failed to pull Docker image. Container deployment skipped."
  fi
fi

# ============================================================================
# Phase 8: Wait for DNS Resolution
# ============================================================================
echo ""
echo "=== Phase 8: Wait for DNS Resolution ==="
DNS_RESOLVED=false
for i in {1..60}; do
  if getent hosts "$DOMAIN_NAME" > /dev/null 2>&1; then
    echo "✓ DNS resolved for $DOMAIN_NAME"
    DNS_RESOLVED=true
    break
  fi
  echo "Waiting for DNS... (attempt $i/60)"
  sleep 5
done

if [ "$DNS_RESOLVED" = false ]; then
  echo "⚠ DNS not resolved after 5 minutes. SSL certificate may fail."
  echo "  Ensure DuckDNS points to this server's public IP."
fi

# ============================================================================
# Phase 9: Request SSL Certificate
# ============================================================================
echo ""
echo "=== Phase 9: Request Let's Encrypt Certificate ==="
if [ ! -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
  echo "Requesting certificate for $DOMAIN_NAME..."
  certbot certonly \
    --nginx \
    --domain "$DOMAIN_NAME" \
    --email "$CERT_EMAIL" \
    --agree-tos \
    --non-interactive \
    --preferred-challenges http \
    --quiet || {
      echo "⚠ Certificate request failed. Check DNS resolution and port 80 access."
    }
else
  echo "✓ Certificate already exists for $DOMAIN_NAME"
fi

# ============================================================================
# Phase 10: Configure Nginx HTTPS
# ============================================================================
echo ""
echo "=== Phase 10: Configure Nginx HTTPS ==="
if [ -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
  cat > /etc/nginx/sites-available/default <<NGINX_HTTPS
# Nginx HTTPS configuration for Agri Price Tracker
# Configured with Let's Encrypt SSL/TLS

# Redirect HTTP to HTTPS
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name $DOMAIN_NAME;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
    return 301 https://\$server_name\$request_uri;
  }
}

# HTTPS Server Block
server {
  listen 443 ssl http2 default_server;
  listen [::]:443 ssl http2 default_server;
  server_name $DOMAIN_NAME;

  # SSL Certificate (managed by Certbot)
  ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

  # SSL Configuration (security best practices)
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;

  # Reverse Proxy Configuration
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
  }
}
NGINX_HTTPS

  nginx -t && systemctl reload nginx
  echo "✓ Nginx HTTPS configured and reloaded"
else
  echo "⚠ SSL certificate not found. Nginx HTTPS not configured."
  echo "  Application will be accessible via HTTP only."
fi

# ============================================================================
# Phase 11: Setup Automatic Certificate Renewal
# ============================================================================
echo ""
echo "=== Phase 11: Setup Certificate Auto-Renewal ==="
cat > /usr/local/bin/certbot-renew.sh <<'RENEW_SCRIPT'
#!/bin/bash
# Auto-renew Let's Encrypt certificates
certbot renew --quiet --agree-tos --non-interactive 2>&1 | logger -t certbot-renewal
nginx -s reload 2>/dev/null || systemctl reload nginx
RENEW_SCRIPT

chmod +x /usr/local/bin/certbot-renew.sh

# Add cron job for daily renewal
(crontab -l 2>/dev/null | grep -v "certbot-renew" || true; echo "30 3 * * * /usr/local/bin/certbot-renew.sh") | crontab -
echo "✓ Certificate auto-renewal scheduled (daily at 3:30 AM)"

# ============================================================================
# Phase 12: Verification and Summary
# ============================================================================
echo ""
echo "=== Phase 12: Deployment Verification ==="
echo ""
echo "Container Status:"
docker ps --filter "name=agric-price-tracker-app" || echo "⚠ Container not running"

echo ""
echo "Network Connectivity:"
if getent hosts "$DOMAIN_NAME" > /dev/null 2>&1; then
  IP=$(getent hosts "$DOMAIN_NAME" | awk '{ print $1 }')
  echo "✓ Domain resolves to: $IP"
else
  echo "⚠ Domain not resolving. Check DuckDNS configuration."
fi

echo ""
echo "SSL Certificate:"
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
  EXPIRY=$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" -noout -enddate | cut -d= -f2)
  echo "✓ Certificate installed, expires: $EXPIRY"
else
  echo "⚠ Certificate not found"
fi

echo ""
echo "Nginx Status:"
systemctl status nginx | head -3

echo ""
echo "=== Deployment Complete at $(date) ==="
echo ""
echo "Application Details:"
echo "  URL: http://$DOMAIN_NAME (HTTP) or https://$DOMAIN_NAME (HTTPS)"
echo "  Domain: $DOMAIN_NAME"
echo "  Container: agric-price-tracker-app"
echo "  Port: 3000 (internal) → 80/443 (Nginx)"
echo "  SSL: Let's Encrypt (auto-renewal daily)"
echo ""
echo "Logs:"
echo "  Deployment: /var/log/agri-price-tracker-deploy.log"
echo "  Application: docker logs agric-price-tracker-app"
echo "  Nginx: /var/log/nginx/access.log, /var/log/nginx/error.log"
echo "  Certificate: certbot logs"
echo ""
