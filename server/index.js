const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import routes
const projectsRouter = require("./routes/projects");
const milestonesRouter = require("./routes/milestones");
const disbursementsRouter = require("./routes/disbursements");
const issuesRouter = require("./routes/issues");
const reportsRouter = require("./routes/reports");
const aiRouter = require("./routes/ai");
const { authMiddleware } = require("./middleware/auth");
const uploadsRouter = require("./routes/uploads");

const path = require("path");

const app = express();

// CORS configuration to allow credentials and specific origins
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());

// Serve React build (if present). API routes take precedence; static files served in production.
const clientBuildPath = path.join(__dirname, "..", "client", "build");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));
}

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", time: new Date().toISOString() });
});

// Public auth endpoints (defined inline for simplicity)
app.post("/api/auth/login", async (req, res) => {
  // Accept a Firebase ID token from client and verify it server-side
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "idToken is required" });

  try {
    const { admin, db } = require("./config/firebase");
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || null;
    const displayName = decoded.name || decoded.displayName || null;

    // Fetch or create basic user record in Firestore
    let role = decoded.role || "citizen";
    try {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data && data.role) role = data.role;
        // keep basic fields updated
        await userRef.update({
          email,
          displayName,
          lastSeen: new Date().toISOString(),
        });
      } else {
        await userRef.set({
          email,
          displayName,
          role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("User lookup/create failed:", err.message);
    }

    // Return the same idToken to be used as Bearer token by client
    res.json({ token: idToken, user: { uid, email, role, displayName } });
  } catch (err) {
    console.error("Login error verifying idToken:", err);
    res.status(401).json({ error: "Invalid idToken", details: err.message });
  }
});

// Protected routes
app.use("/api", projectsRouter);
app.use("/api", milestonesRouter);
app.use("/api", disbursementsRouter);
app.use("/api", issuesRouter);
app.use("/api", reportsRouter);
app.use("/api", uploadsRouter);
app.use("/api/ai", aiRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✓ GRAPTS Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});
