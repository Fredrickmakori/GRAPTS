const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  path.join(__dirname, "serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  // Provide storage bucket name from env or default to project bucket
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "grapts-5183e.firebasestorage.app",
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
