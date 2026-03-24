# Agri Price Tracker Ghana

Tagline: Helping Ghanaian farmers, traders, and households make better crop pricing decisions with simple, timely market data.

## Problem Statement
Ghana is facing rising food prices and instability in key agricultural commodities, including cocoa. Smallholder farmers, market traders, and households often lack timely and comparable price information for staples. This project provides a simple way to view current prices for common crops to support better buying, selling, and planning decisions.

## African Context
- Country focus: Ghana
- Current challenge: Rising food prices and cocoa-sector pressure
- Opportunity: Active agri-tech ecosystem that can support practical digital tools

## Target Users
- Smallholder farmers in Ghana who need current market prices before selling produce
- Market traders and aggregators who compare prices across markets for better purchasing decisions
- Urban and peri-urban households who track staple food price changes for monthly budgeting

## Core Features (Planned)
- Display latest prices for 5 crops: Maize, Rice, Cocoa, Tomatoes, and Peanuts
- Show market name, unit of measure, and last-updated timestamp for each crop price
- Provide a JSON API endpoint (`/api/prices`) for machine-readable integration
- Support future price-change alerts for significant increases or decreases
- Support future historical trend comparison to track price movement over time

## Technology Stack
- Runtime: Node.js
- Backend: Native Node.js HTTP server (no external framework in this phase)
- Data: Local JSON seed data
- Version Control: Git and GitHub
- Infrastructure: Terraform (Azure)
- Configuration Management: Ansible
- CI/CD: GitHub Actions
- Registry: Azure Container Registry (ACR)

## Team Members and Roles
- Nyabon Deng Adut - Backend Developer 
- Christelle Usanase - Documentation Lead
- Agnes Adepa Berko - Backend Developer & DevOps Coordinator
- Nduka-aku Oluchi Rejoice - Team Lead

## Initial Functional Feature Implemented
This repository currently includes one working core feature:
- Display latest prices for 5 crops in a browser page
- Provide machine-readable data at `/api/prices`

## Local Setup and Run
Prerequisite:
- Node.js 18+

Run steps:
1. Clone the repository
2. Open the project folder
3. Start the server:

```bash
npm start
```

4. Open in browser:
- `http://localhost:3000/` for UI
- `http://localhost:3000/api/prices` for JSON

## Run with Docker Compose
Prerequisites:
- Docker Desktop (or Docker Engine + Compose)

Run steps:
1. From the project root, build and run containers:

```bash
docker compose up --build
```

2. Open in browser:
- `http://localhost:3000/` for UI
- `http://localhost:3000/api/prices` for JSON

3. Stop the containers:

```bash
docker compose down
```

## Live Deployment
- Live Application URL: `<ADD_LIVE_URL_HERE>`
- Final Presentation Video Link: `<ADD_VIDEO_LINK_HERE>`

## Architecture Diagram
The production deployment uses this flow:

```text
Developer Push/PR
   |
   v
 GitHub Actions CI (lint, test, trivy, tfsec)
   |
   v
 Merge to main
   |
   v
 GitHub Actions CD
  - Build image
  - Push to ACR
  - Run Ansible deploy
   |
   v
 Azure VM (private subnet) running Docker container
   |
   v
 App serves HTTP traffic

Terraform provisions:
- Virtual Network with public and private subnets
- Azure Bastion host in public subnet
- App VM in private subnet
- Managed PostgreSQL
- Network security groups
- Azure Container Registry
```

## Infrastructure as Code (Terraform)
Terraform code is in [terraform/main.tf](terraform/main.tf), [terraform/provider.tf](terraform/provider.tf), [terraform/variables.tf](terraform/variables.tf), and [terraform/outputs.tf](terraform/outputs.tf).

Expected Terraform flow:

```bash
cd terraform
terraform init
terraform plan -var "db_username=<db_user>" -var "db_password=<db_password>"
terraform apply -var "db_username=<db_user>" -var "db_password=<db_password>"
```

## Configuration Management (Ansible)
Ansible playbook is in [ansible/deploy.yml](ansible/deploy.yml) with inventory in [ansible/inventory.ini](ansible/inventory.ini).

The playbook:
- Installs Docker and Docker Compose plugin
- Logs in to ACR (when credentials are provided)
- Pulls the latest application image
- Recreates and runs the container on the VM

Run manually:

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

## CI and CD Workflows
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
  - Trigger: push to non-main branches and pull requests to main
  - Steps: lint, tests, Docker build, Trivy image scan, tfsec IaC scan
- CD workflow: [.github/workflows/cd.yml](.github/workflows/cd.yml)
  - Trigger: push to main
  - Steps: rerun quality/security checks, build image, push to ACR, deploy via Ansible

Required GitHub repository secrets for CD:
- `ACR_LOGIN_SERVER`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `APP_PRIVATE_IP`
- `SSH_PRIVATE_KEY`

## API Documentation

### GET /api/prices
Returns current prices for all tracked crops.

**Response Format:**
```json
{
  "country": "Ghana",
  "generatedAt": "2026-02-22T10:30:00.000Z",
  "items": [
    {
      "crop": "Maize",
      "market": "Kumasi Central Market",
      "unit": "100kg bag",
      "priceGHS": 760,
      "lastUpdated": "2026-02-22"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 404: Route not found

## Planned GitHub Project Board
Kanban columns to use:
- Backlog
- In Progress
- Done

The prepared backlog items are in `docs/github-project-backlog.md` and can be copied into GitHub Projects.

## Security and Repository Practices
- Comprehensive `.gitignore` included
- MIT `LICENSE` included
- Branch protection checklist included in `docs/branch-protection-checklist.md`
- Optional `CODEOWNERS` scaffold included in `.github/CODEOWNERS`

## DevOps and Course Alignment
- LO1: Uses version control and secure repository practices from project start
- LO6: Defines collaboration roles, workflow, and review expectations
- LO7: Keeps structure modular so it can evolve toward microservices in later phases
