# GRAPTS - Government Resource Allocation & Project Tracking System (MVP)

This repository contains a complete MVP implementation for GRAPTS.

## Structure

- `client/` - React frontend
- `server/` - Node.js + Express backend

## Getting Started (Development)

### Server Setup

```powershell
cd server
npm install
npm run dev
```

### Client Setup

```powershell
cd client
npm install
npm start
```

## Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Copy `server/.env.example` to `server/.env` and add your credentials
3. Copy `client/.env.example` to `client/.env` and add your Firebase config
4. Download your service account key and save it in `server/serviceAccountKey.json`

For detailed setup, see `server/README.md` and `client/README.md`.
