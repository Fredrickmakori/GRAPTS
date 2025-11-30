# GRAPTS Server

Node.js + Express backend for GRAPTS with Firebase Firestore, Firebase Auth, and Audit Logging.

## Setup

### 1. Install Dependencies

```powershell
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```powershell
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

- `FIREBASE_SERVICE_ACCOUNT`: Path to your Firebase service account JSON (download from Firebase Console)
- `FIREBASE_DATABASE_URL`: Your Firestore database URL
- `JWT_SECRET`: A strong secret key for JWT token signing
- `PORT`: Port the server will run on (default: 4000)

### 3. Download Firebase Service Account Key

1. Go to https://console.firebase.google.com/
2. Select your project → Settings (gear icon) → Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file to `server/serviceAccountKey.json`

### 4. Run Development Server

```powershell
npm run dev
```

The server will start on `http://localhost:4000`.

## API Routes

- `GET /api/ping` - Health check
- `POST /api/auth/login` - User login (returns JWT token)
- `GET/POST /api/projects` - Project management
- `GET/PUT /api/projects/:id` - Update project
- `GET/POST /api/projects/:projectId/milestones` - Milestone management
- `GET/POST /api/projects/:projectId/disbursements` - Disbursement tracking
- `GET /api/disbursements/summary` - Fund allocation summary
- `GET/POST /api/issues` - Issue/complaint management
- `GET /api/audit-logs` - Audit log retrieval
- `GET /api/audit-logs/verify/integrity` - Verify audit ledger
- `GET /api/reports/activity` - Activity report
- `GET /api/reports/budget` - Budget/fund report

All routes except `/api/ping` and `/api/auth/login` require JWT authentication.

## Architecture

- **config/firebase.js** - Firebase Admin initialization
- **middleware/auth.js** - JWT auth & RBAC middleware
- **services/auditLog.js** - Audit logging with SHA-256 hashing
- **routes/** - API endpoint handlers

## Firestore Schema

See `FIRESTORE_SCHEMA.md` for database structure.
