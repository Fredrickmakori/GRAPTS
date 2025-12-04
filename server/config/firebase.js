const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

let credential;

// Try to get service account from environment variable (for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // If it's a base64-encoded JSON string
    const serviceAccountStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
    credential = admin.credential.cert(JSON.parse(serviceAccountStr));
  } catch (err) {
    // If it's a raw JSON string
    try {
      credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } catch (err2) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err2.message);
      throw err2;
    }
  }
} else {
  // Fall back to local file for development
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  try {
    credential = admin.credential.cert(require(serviceAccountPath));
  } catch (err) {
    console.warn("Warning: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var not set. Firebase Admin will not be initialized.");
    credential = null;
  }
}

// Initialize Firebase Admin
if (credential) {
  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || "grapts-5183e.firebasestorage.app",
  });
} else {
  console.error("ERROR: Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT or provide serviceAccountKey.json");
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
