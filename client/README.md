# GRAPTS Client

React frontend for GRAPTS with authentication, project management, and public dashboard.

## Setup

### 1. Install Dependencies

```powershell
cd client
npm install
```

If you're adding Tailwind CSS and PostCSS (used by this scaffold), run:

```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Also install `react-icons` if not already installed:

```powershell
npm install react-icons
```

### 2. Configure Environment

Create a `.env` file in the `client` directory:

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Get these values from your Firebase project → Settings → General.

### 3. Run Development Server

```powershell
npm start
```

The app will run on `http://localhost:3000`.

## Features

- **Login Page** - User authentication
- **Admin Dashboard** - Create and manage projects
- **Auditor Dashboard** - View audit logs and verify ledger
- **Citizen Portal** - View public projects and budget info
- **Reports** - Budget allocation and analytics
- **Navigation** - Role-based menu

## Pages

- `/login` - User login
- `/admin` - Admin project management
- `/auditor` - Audit log viewer
- `/citizen` - Public project portal
- `/reports` - Budget reports

## Architecture

- **services/api.js** - API client for backend
- **services/AuthContext.js** - Authentication & state
- **pages/** - Dashboard pages
- **components/** - Reusable components
- **styles/** - CSS styles
