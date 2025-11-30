import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Default Firebase config (falls back to environment variables).
// Provided config values (can be overridden via .env)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyCnJQjcRs2XtJZuJcN3KtOg75K6RM3Q2fM",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "grapts-5183e.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "grapts-5183e",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "grapts-5183e.firebasestorage.app",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "576756303354",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:576756303354:web:202e8af5499d4560345043",
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LVMS63YGB1",
};

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
    // Analytics only available in browser environments
    if (typeof window !== "undefined") {
      getAnalytics(app);
    }
  } catch (err) {
    // ignore analytics initialization errors (not critical)
    // console.warn('Analytics not initialized', err);
  }

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

export const api = {
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",

  async fetchProjects(token) {
    const response = await fetch(`${this.baseURL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async createProject(data, token) {
    const response = await fetch(`${this.baseURL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async fetchMilestones(projectId, token) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/milestones`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  },

  async fetchDisbursements(projectId, token) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/disbursements`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  },

  async fetchAuditLogs(token, params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/audit-logs?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async fetchReports(type, token) {
    const response = await fetch(`${this.baseURL}/reports/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
