const express = require("express");
const { db } = require("../config/firebase");
const { logAuditAction } = require("../services/auditLog");
const { authMiddleware, requirePermission } = require("../middleware/auth");

const router = express.Router();

// Create a new project
router.post(
  "/projects",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { name, description, budget, location, startDate, endDate } =
        req.body;

      if (!name || !budget) {
        return res.status(400).json({ error: "Name and budget are required" });
      }

      const projectData = {
        name,
        description,
        budget,
        location,
        startDate,
        endDate,
        status: "Pending",
        createdBy: req.user.uid,
        createdAt: new Date().toISOString(),
        allocatedFunds: 0,
        usedFunds: 0,
      };

      const docRef = await db.collection("projects").add(projectData);

      // Log to audit trail
      await logAuditAction(
        "CREATE",
        "project",
        docRef.id,
        req.user.uid,
        req.user.role,
        { projectName: name }
      );

      res.status(201).json({ id: docRef.id, ...projectData });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get all projects (with role-based filtering)
router.get("/projects", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("projects").get();
    const projects = [];
    snapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single project by ID
router.get("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("projects").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a project
router.put(
  "/projects/:id",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { name, description, budget, status } = req.body;
      const updates = { updatedAt: new Date().toISOString() };

      if (name) updates.name = name;
      if (description) updates.description = description;
      if (budget) updates.budget = budget;
      if (status) updates.status = status;

      await db.collection("projects").doc(req.params.id).update(updates);

      // Log to audit trail
      await logAuditAction(
        "UPDATE",
        "project",
        req.params.id,
        req.user.uid,
        req.user.role,
        updates
      );

      res.json({ id: req.params.id, ...updates });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
