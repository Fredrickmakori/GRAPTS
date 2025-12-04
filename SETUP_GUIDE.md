# GRAPTS Development Setup

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\setup.ps1
```

**macOS/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
# Install all dependencies at once
npm run install:all
```

## Running the Application

### Start Both Client and Server Together

```bash
npm run dev
```

This will start:

- **Client** on `http://localhost:3000`
- **Server** on `http://localhost:4000`

### Start Separately (in different terminals)

Terminal 1 - Start the client:

```bash
npm run dev:client
```

Terminal 2 - Start the server:

```bash
npm run dev:server
```

## Project Structure

```
GRAPTS/
├── client/                 # React frontend (port 3000)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── server/                 # Express backend (port 4000)
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── index.js
│   ├── package.json
│   └── .env
├── package.json            # Root workspace config
├── setup.ps1              # Windows setup script
├── setup.sh               # macOS/Linux setup script
└── README.md
```

## Requirements

- **Node.js** 14+ (check with `node --version`)
- **npm** 6+ (check with `npm --version`)
- **Firebase Project** configured for authentication
- **.env files** in both `client` and `server` directories

## Environment Variables

### Client (.env in `client/`)

```
REACT_APP_FIREBASE_API_KEY=<your_api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
REACT_APP_FIREBASE_PROJECT_ID=<your_project_id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
REACT_APP_FIREBASE_APP_ID=<your_app_id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<your_measurement_id>
REACT_APP_API_URL=http://localhost:4000/api
```

### Server (.env in `server/`)

```
NODE_ENV=development
PORT=4000
FIREBASE_PROJECT_ID=<your_project_id>
CLIENT_URL=http://localhost:3000
```

## Troubleshooting

### Dependencies Not Installed

```bash
npm run install:all
```

### Port Already in Use

- **Client (3000)**: Kill the process or change the port in `client/.env`
- **Server (4000)**: Kill the process or change `PORT` in `server/.env`

### Backend Not Connecting

Ensure the server is running on `http://localhost:4000/api` and the `REACT_APP_API_URL` env var is set correctly in the client.

### Firebase Auth Issues

1. Enable Google provider in Firebase Console
2. Add `http://localhost:3000/` to authorized origins and redirect URIs
3. Ensure service account JSON is placed in `server/` (not in version control)

## Available npm Scripts

**Root level:**

- `npm run install:all` - Install all dependencies
- `npm run dev` - Start both client and server
- `npm run dev:client` - Start client only
- `npm run dev:server` - Start server only
- `npm run build` - Build client for production
- `npm run build:full` - Full setup and build
- `npm run test` - Run client tests

## Deployment

### Vercel (Client)

```bash
# Ensure leaflet.markercluster is in client/package.json
npm run build
```

### Server Hosting

Deploy the `server/` folder to:

- Heroku
- Railway
- Render
- Google Cloud Run
- AWS Lambda (with appropriate adapters)

Ensure environment variables are configured on your hosting platform.

## Support

For issues, check:

1. Console errors in browser DevTools (F12)
2. Server logs in terminal
3. Firebase Console for auth/database issues
4. `.env` files are configured correctly
