# Filo Backend (Node.js + Express)

## Setup

- Create `.env` based on `.env.example`.
- Provide Firebase Admin credentials via `FIREBASE_ADMIN_CREDENTIALS` JSON or use Application Default.

## Run

```
cd backend
npm install
npm run start
```

## API

- GET `/api/health` — status
- GET `/api/me` — returns decoded user (requires `Authorization: Bearer <idToken>`)
- GET `/api/barbershops` — list barbershops (protected)
