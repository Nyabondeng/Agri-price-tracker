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

## Team Members and Roles
- Nyabon Deng Adut - Backend Developer 
- Christelle Usanase - Documentation Lead
- Agns Adepa Berko - Backend Developer & DevOps Coordinator

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
node src/server.js
```

4. Open in browser:
- `http://localhost:3000/` for UI
- `http://localhost:3000/api/prices` for JSON

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

## Next Step After This Phase
- Install dependencies only when needed for next features
- Add pull-request workflow and protected main branch settings in GitHub
- Begin feature expansion with filters, history, and alerts