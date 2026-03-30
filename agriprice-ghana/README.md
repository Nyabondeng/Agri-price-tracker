# AgriPrice Ghana (Full-Stack)

AgriPrice Ghana is a full-stack platform for real-time and historical agricultural commodity price tracking in Ghana.

## Features
- Role-based access: Guest, Registered User, Admin
- Real-time price dashboard with region/crop filters
- Trend visualization using Recharts
- Registered-user price submissions with admin approval workflow
- Historical trend and regional comparison endpoints
- Alert subscriptions for significant price changes
- Firebase Authentication support (Email/Password + Google Sign-In)
- Paystack donation flow (guest donation supported)
- Bonus: lightweight offline support (PWA shell) and simple trend-based price prediction
- Bonus: English + Twi language toggle on dashboard

## Tech Stack
- Frontend: React + Tailwind CSS + Recharts + Firebase SDK
- Backend: Node.js + Express.js + MongoDB (Mongoose)
- Auth: JWT + Firebase token verification
- Payments: Paystack

## Project Structure
```text
agriprice-ghana/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      seed/
      utils/
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      services/
  docker-compose.yml
```

## Setup
### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Public domain (DuckDNS): `http://agri-price-tracker.duckdns.org/`

## Default Seed Users
- Admin: `admin@agripricegh.com` / `Admin123!`
- User: `farmer@agripricegh.com` / `User123!`

## Docker (Optional)
From `agriprice-ghana/`:
```bash
docker compose up --build
```

## Environment Variables
See `backend/.env.example` and `frontend/.env.example`.

## Requirement Coverage
- Frontend: React + Tailwind + Recharts implemented
- Backend: Node.js + Express + MongoDB implemented
- Authentication: Firebase token exchange for Google and (when configured) Email/Password, with JWT for API protection
- Roles: Guest, Registered User, Admin flows implemented
- Price dashboard, filters, history, compare, and charts implemented
- Submission and admin approval workflow implemented
- Alerts subscriptions and scheduled checks implemented
- Donation flow with Paystack endpoint integration implemented
- Deployment-ready files: Dockerfiles, compose, env templates, API docs implemented
- Bonus: PWA shell, English/Twi toggle, simple trend prediction endpoint implemented

## Final Setup Tasks (External)
These are required outside code to make production features fully active:

1. Configure Firebase project settings
- Enable Email/Password and Google providers in Firebase Console
- Add your deployed domain to authorized domains
- Add real values in `frontend/.env`

2. Configure Firebase Admin SDK for backend
- Download service-account key from Firebase Console
- Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `backend/.env`

3. Configure public domain routing
- Domain: `agri-price-tracker.duckdns.org`
- Open firewall/router forwarding to your app host (or deploy to cloud VM/App Service)
- Serve HTTPS in production (recommended)

4. Configure optional integrations
- Paystack: set `PAYSTACK_SECRET_KEY`
- Alerts email: set SMTP variables in `backend/.env`

## API Documentation
See `docs/API.md`.

## Security Best Practices Included
- JWT route protection + role authorization
- Request validation with `express-validator`
- Helmet and CORS setup
- Centralized error handling
- Secret keys in environment variables
