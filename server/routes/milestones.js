const express = require("express");
const { db } = require("../config/firebase");
const { logAuditAction } = require("../services/auditLog");
const { authMiddleware, requirePermission } = require("../middleware/auth");

const router = express.Router();

// Add a milestone to a project
router.post(
  "/projects/:projectId/milestones",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { title, description, targetDate, budget } = req.body;
      const { projectId } = req.params;

      if (!title || !targetDate) {
        return res
          .status(400)
          .json({ error: "Title and targetDate are required" });
      }

      const milestoneData = {
        projectId,
        title,
        description,
        targetDate,
        budget,
        status: "Pending",
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid,
      };

      const docRef = await db.collection("milestones").add(milestoneData);

      // Log to audit trail
      await logAuditAction(
        "CREATE",
        "milestone",
        docRef.id,
        req.user.uid,
        req.user.role,
        { title, projectId }
      );

      res.status(201).json({ id: docRef.id, ...milestoneData });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get milestones for a project
router.get(
  "/projects/:projectId/milestones",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await db
        .collection("milestones")
        .where("projectId", "==", projectId)
        .get();
      const milestones = [];
      snapshot.forEach((doc) => {
        milestones.push({ id: doc.id, ...doc.data() });
      });
      res.json(milestones);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update milestone status (for verification workflow)
router.put(
  "/milestones/:id",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { status, verificationNotes } = req.body;

      const updates = { updatedAt: new Date().toISOString() };
      if (status) updates.status = status;
      if (verificationNotes) updates.verificationNotes = verificationNotes;

      await db.collection("milestones").doc(req.params.id).update(updates);

      // Log to audit trail
      await logAuditAction(
        "UPDATE",
        "milestone",
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
