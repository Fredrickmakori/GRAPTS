import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase config must come from environment variables only.
// Do NOT store secrets or API keys in source code. Provide them via
// `client/.env.local` (for development) and via your deployment's env settings.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Debug: show which API key was bundled (remove in production)
try {
  if (process.env.NODE_ENV === "development") {
    const key = DEFAULT_FIREBASE_CONFIG.apiKey || "";
    const visible = key ? `***${key.slice(-6)}` : "undefined";
    // eslint-disable-next-line no-console
    console.info("Firebase API Key (client) =", visible);
  }
} catch (e) {}

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

export const initFirebase = () => {
  if (firebaseApp)
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    };

  try {
    // Log the config being used (masked for security)
    const apiKey = DEFAULT_FIREBASE_CONFIG.apiKey || "undefined";
    const maskedKey =
      apiKey && apiKey !== "undefined" ? `***${apiKey.slice(-6)}` : "undefined";
    const projectId = DEFAULT_FIREBASE_CONFIG.projectId || "undefined";

    // eslint-disable-next-line no-console
    console.log("[GRAPTS] Initializing Firebase with:");
    // eslint-disable-next-line no-console
    console.log("  API Key (masked):", maskedKey);
    // eslint-disable-next-line no-console
    console.log("  Project ID:", projectId);
    // eslint-disable-next-line no-console
    console.log("  Auth Domain:", DEFAULT_FIREBASE_CONFIG.authDomain);

    // Initialize with whatever env vars are present. If required fields are missing
    // Firebase init will throw; we catch and re-throw further below with masked info.
    const app = initializeApp(DEFAULT_FIREBASE_CONFIG);
    firebaseApp = app;

    try {
      if (typeof window !== "undefined") getAnalytics(app);
    } catch (_) {}

    firebaseAuth = getAuth(app);
    firebaseDb = getFirestore(app);
    firebaseStorage = getStorage(app);

    // eslint-disable-next-line no-console
    console.log("[GRAPTS] Firebase initialized successfully");

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[GRAPTS] Firebase initialization failed:", err);
    // eslint-disable-next-line no-console
    console.error("[GRAPTS] Config used (masked):", {
      apiKey: DEFAULT_FIREBASE_CONFIG.apiKey
        ? `***${DEFAULT_FIREBASE_CONFIG.apiKey.slice(-6)}`
        : "undefined",
      projectId: DEFAULT_FIREBASE_CONFIG.projectId || "undefined",
      authDomain: DEFAULT_FIREBASE_CONFIG.authDomain || "undefined",
      appId: DEFAULT_FIREBASE_CONFIG.appId || "undefined",
    });
    throw err;
  }
};

// -----------------------------
// BASE API URL
// -----------------------------
// In Cloudflare Worker deployment, API is served from the same origin.
// Use relative URLs for production (Worker serves both backend and frontend).
// For local development, set REACT_APP_API_URL to your local server (e.g., http://localhost:4000).
const rawApiUrl = process.env.REACT_APP_API_URL;
const isWorkerDeployment = !rawApiUrl || rawApiUrl.includes('workers.dev') || rawApiUrl.includes('grapts');
const BASE_URL = isWorkerDeployment ? '' : rawApiUrl;

// Runtime checks: validate that important envs are present
export function checkRuntimeConfig() {
  try {
    if (typeof window === "undefined") return;

    const missing = [];
    const envMap = {
      REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
    };

    Object.entries(envMap).forEach(([k, v]) => {
      if (!v) missing.push(k);
    });

    // Mask API key for logs
    const apiKey = envMap.REACT_APP_FIREBASE_API_KEY || "";
    const maskedKey = apiKey ? `***${apiKey.slice(-6)}` : "undefined";

    if (missing.length > 0) {
      console.warn(
        `[GRAPTS] Runtime config: missing envs: ${missing.join(", ")}. Firebase may fail in production.`
      );
      console.info(`[GRAPTS] Firebase API Key (masked): ${maskedKey}`);
    } else {
      console.info(`[GRAPTS] Firebase config looks present. API Key (masked): ${maskedKey}`);
    }

    // In production, do not allow missing API URL for non-Worker deployments
    if (process.env.NODE_ENV === "production" && !isWorkerDeployment) {
      if (!BASE_URL) {
        console.error("[GRAPTS] REACT_APP_API_URL is not set. Set it for non-Worker production deployment.");
      }
    }
  } catch (e) {
    console.error("[GRAPTS] Error in checkRuntimeConfig:", e);
  }
}

export { BASE_URL };

// -----------------------------
// INDIVIDUAL FUNCTION EXPORTS
// -----------------------------

export async function fetchProjects(token) {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchPublicProjects() {
  const res = await fetch(`${BASE_URL}/projects/public`);
  return res.json();
}

export async function fetchProjectById(id, token) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createProject(data, token) {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchMilestones(projectId, token) {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function verifyMilestone(projectId, milestoneId, token) {
  const res = await fetch(`${BASE_URL}/audits/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId, milestoneId }),
  });
  return res.json();
}

export async function fetchDisbursements(projectId, token) {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/disbursements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchAuditLogs(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/audit-logs?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchReports(type, token) {
  const res = await fetch(`${BASE_URL}/reports/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchBudgetReport(token) {
  const res = await fetch(`${BASE_URL}/reports/budget`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// -----------------------------
// OPTIONAL: RETAIN api OBJECT
// -----------------------------
export const api = {
  fetchProjects,
  fetchPublicProjects,
  fetchProjectById,
  createProject,
  fetchMilestones,
  verifyMilestone,
  fetchDisbursements,
  fetchAuditLogs,
  fetchReports,
  fetchBudgetReport,
};
