const express = require("express");
const { db } = require("../config/firebase");
const { logAuditAction } = require("../services/auditLog");
const { authMiddleware, requirePermission } = require("../middleware/auth");

const router = express.Router();

// Create an issue/complaint
router.post("/issues", authMiddleware, async (req, res) => {
  try {
    const { projectId, title, description, category } = req.body;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ error: "Title and projectId are required" });
    }

    const issueData = {
      projectId,
      title,
      description,
      category,
      status: "Open",
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
      createdByRole: req.user.role,
      resolvedAt: null,
      resolutionNotes: null,
    };

    const docRef = await db.collection("issues").add(issueData);

    // Log to audit trail
    await logAuditAction(
      "CREATE",
      "issue",
      docRef.id,
      req.user.uid,
      req.user.role,
      { title, projectId }
    );

    res.status(201).json({ id: docRef.id, ...issueData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get issues for a project
router.get("/projects/:projectId/issues", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const snapshot = await db
      .collection("issues")
      .where("projectId", "==", projectId)
      .get();
    const issues = [];
    snapshot.forEach((doc) => {
      issues.push({ id: doc.id, ...doc.data() });
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update issue status
router.put(
  "/issues/:id",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { status, resolutionNotes } = req.body;

      const updates = { updatedAt: new Date().toISOString() };
      if (status) {
        updates.status = status;
        if (status === "Resolved") {
          updates.resolvedAt = new Date().toISOString();
        }
      }
      if (resolutionNotes) updates.resolutionNotes = resolutionNotes;

      await db.collection("issues").doc(req.params.id).update(updates);

      // Log to audit trail
      await logAuditAction(
        "UPDATE",
        "issue",
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
