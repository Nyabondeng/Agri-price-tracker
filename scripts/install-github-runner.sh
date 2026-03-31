#!/bin/bash
# GitHub Actions Self-Hosted Runner Installation Script
# Run this on your Bastion Host to enable automated CI/CD deployments

set -euo pipefail

# Configuration
GITHUB_REPO_URL="${1:-https://github.com/YOUR_USERNAME/Agri-price-tracker}"
GITHUB_TOKEN="${2:-}"
RUNNER_NAME="${3:-Bastion-Runner-1}"
RUNNER_VERSION="2.120.0"
RUNNER_DIR="/opt/github-actions-runner"

echo "=========================================="
echo "GitHub Actions Self-Hosted Runner Setup"
echo "=========================================="
echo "Repository: $GITHUB_REPO_URL"
echo "Runner Name: $RUNNER_NAME"
echo "Install Directory: $RUNNER_DIR"
echo ""

# Validate inputs
if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GitHub token is required!"
    echo "Usage: $0 <repo_url> <github_token> [runner_name]"
    echo ""
    echo "To get token:"
    echo "1. Go to GitHub → Repo → Settings → Actions → Runners"
    echo "2. Click 'New self-hosted runner'"
    echo "3. Copy the TOKEN from the setup instructions"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
sudo apt-get update
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev

# Create runner directory
echo "Creating runner directory..."
sudo mkdir -p "$RUNNER_DIR"
sudo chown azureuser:azureuser "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Download runner
echo "Downloading GitHub Actions Runner v${RUNNER_VERSION}..."
curl -o actions-runner-linux-x64.tar.gz -L \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64.tar.gz"

# Verify download
echo "Verifying runner package..."
tar tzf actions-runner-linux-x64.tar.gz > /dev/null || {
    echo "ERROR: Failed to download runner!"
    exit 1
}

# Extract runner
echo "Extracting runner..."
tar xzf ./actions-runner-linux-x64.tar.gz
rm actions-runner-linux-x64.tar.gz

# Configure runner (non-interactive using token)
echo "Configuring runner..."
./config.sh \
    --url "$GITHUB_REPO_URL" \
    --token "$GITHUB_TOKEN" \
    --name "$RUNNER_NAME" \
    --runnergroup "Default" \
    --labels "linux,azure,automated-deployment" \
    --unattended

# Install as systemd service
echo "Installing as systemd service..."
sudo ./svc.sh install

# Start the service
echo "Starting runner service..."
sudo ./svc.sh start

# Verify service is running
echo ""
echo "=========================================="
echo "✅ Runner Installation Complete!"
echo "=========================================="
echo ""
echo "Runner Status:"
sudo ./svc.sh status
echo ""
echo "Check GitHub: Settings → Actions → Runners"
echo "Your runner should appear as 'online' in a few seconds"
echo ""
echo "To stop the runner:"
echo "  sudo systemctl stop actions.runner.* "
echo ""
echo "To view logs:"
echo "  sudo journalctl -u actions.runner.* -f"
