import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Default Firebase config (CRA uses process.env.REACT_APP_*)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCnJQjcRs2XtJZuJcN3KtOg75K6RM3Q2fM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "grapts-5183e.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "grapts-5183e",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "grapts-5183e.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "576756303354",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:576756303354:web:202e8af5499d4560345043",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LVMS63YGB1",
};

// Debug: show which API key was bundled (remove in production)
try {
  if (process.env.NODE_ENV === 'development') {
    const key = DEFAULT_FIREBASE_CONFIG.apiKey || '';
    const visible = key ? `***${key.slice(-6)}` : 'undefined';
    // eslint-disable-next-line no-console
    console.info('Firebase API Key (client) =', visible);
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

  const app = initializeApp(DEFAULT_FIREBASE_CONFIG);
  firebaseApp = app;

  try {
    if (typeof window !== "undefined") getAnalytics(app);
  } catch (_) {}

  firebaseAuth = getAuth(app);
  firebaseDb = getFirestore(app);
  firebaseStorage = getStorage(app);

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
  };
};

// -----------------------------
// BASE API URL
// -----------------------------
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

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
