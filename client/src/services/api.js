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
// Normalize API URL environment variable in case someone pasted a fallback string
function pickFirstUrl(value) {
  if (!value) return null;
  // Look for first http(s)://... substring
  const m = value.match(/https?:\/\/[^\s\|]+/i);
  if (m) return m[0];
  // fallback: if it's a plain host like localhost:4000, prefix http://
  if (/^localhost(:\d+)?/.test(value)) return `http://${value}`;
  return value;
}

const rawApiUrl = process.env.REACT_APP_API_URL;
const picked = pickFirstUrl(rawApiUrl);
// Do NOT default to localhost. If `REACT_APP_API_URL` is not provided,
// leave `BASE_URL` undefined so misconfiguration surfaces early.
const BASE_URL = picked || undefined;

// Runtime checks: validate that important envs are present and warn with masked output.
export function checkRuntimeConfig() {
  try {
    if (typeof window === "undefined") return;

    const missing = [];
    const envMap = {
      REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN:
        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    };

    Object.entries(envMap).forEach(([k, v]) => {
      if (!v) missing.push(k);
    });

    // Mask API key for logs
    const apiKey =
      envMap.REACT_APP_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey || "";
    const maskedKey = apiKey ? `***${apiKey.slice(-6)}` : "undefined";

    if (missing.length > 0) {
      // show concise guidance
      // eslint-disable-next-line no-console
      console.warn(
        `[GRAPTS] Runtime config: missing envs: ${missing.join(
          ", "
        )}. Firebase may fail in production.`
      );
      // eslint-disable-next-line no-console
      console.info(`[GRAPTS] Firebase API Key (masked): ${maskedKey}`);
      // eslint-disable-next-line no-console
      console.info(`[GRAPTS] Current config:`, {
        api_key: maskedKey,
        project_id:
          process.env.REACT_APP_FIREBASE_PROJECT_ID ||
          DEFAULT_FIREBASE_CONFIG.projectId,
        auth_domain:
          process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
          DEFAULT_FIREBASE_CONFIG.authDomain,
        app_id:
          process.env.REACT_APP_FIREBASE_APP_ID ||
          DEFAULT_FIREBASE_CONFIG.appId,
        api_url: process.env.REACT_APP_API_URL || BASE_URL,
      });
    } else {
      // eslint-disable-next-line no-console
      console.info(
        `[GRAPTS] Firebase config looks present. API Key (masked): ${maskedKey}`
      );
    }

    // In production, do not allow missing or localhost API URLs — fail fast
    if (process.env.NODE_ENV === "production") {
      if (!BASE_URL) {
        // eslint-disable-next-line no-console
        console.error(
          "[GRAPTS] REACT_APP_API_URL is not set. Set it in your environment for production."
        );
        throw new Error("Missing REACT_APP_API_URL in production environment");
      }
      if (BASE_URL.includes("localhost")) {
        // eslint-disable-next-line no-console
        console.error(
          "[GRAPTS] REACT_APP_API_URL points to localhost in production. This is not allowed."
        );
        throw new Error("REACT_APP_API_URL points to localhost in production");
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
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
