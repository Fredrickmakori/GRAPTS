const express = require("express");
const { db } = require("../config/firebase");
const { logAuditAction } = require("../services/auditLog");
const { authMiddleware, requirePermission } = require("../middleware/auth");

const router = express.Router();

// Log a disbursement
router.post(
  "/disbursements",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const { projectId, amount, description, recipient } = req.body;

      if (!projectId || !amount) {
        return res
          .status(400)
          .json({ error: "projectId and amount are required" });
      }

      const disbursementData = {
        projectId,
        amount,
        description,
        recipient,
        status: "Pending",
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid,
        approvedBy: null,
        approvedAt: null,
      };

      const docRef = await db.collection("disbursements").add(disbursementData);

      // Log to audit trail
      await logAuditAction(
        "CREATE",
        "disbursement",
        docRef.id,
        req.user.uid,
        req.user.role,
        { projectId, amount }
      );

      res.status(201).json({ id: docRef.id, ...disbursementData });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get disbursements for a project
router.get(
  "/projects/:projectId/disbursements",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await db
        .collection("disbursements")
        .where("projectId", "==", projectId)
        .get();
      const disbursements = [];
      snapshot.forEach((doc) => {
        disbursements.push({ id: doc.id, ...doc.data() });
      });
      res.json(disbursements);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Approve a disbursement
router.put(
  "/disbursements/:id/approve",
  authMiddleware,
  requirePermission("write"),
  async (req, res) => {
    try {
      const updates = {
        status: "Approved",
        approvedBy: req.user.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("disbursements").doc(req.params.id).update(updates);

      // Log to audit trail
      await logAuditAction(
        "APPROVE",
        "disbursement",
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

// Get summary of allocated vs used funds per project
router.get("/disbursements/summary", authMiddleware, async (req, res) => {
  try {
    const projects = await db.collection("projects").get();
    const summary = [];

    for (const projectDoc of projects.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();

      const disbursements = await db
        .collection("disbursements")
        .where("projectId", "==", projectId)
        .get();

      let totalDisbursed = 0;
      disbursements.forEach((doc) => {
        if (doc.data().status === "Approved") {
          totalDisbursed += doc.data().amount;
        }
      });

      summary.push({
        projectId,
        projectName: projectData.name,
        budget: projectData.budget,
        allocated: projectData.allocatedFunds || 0,
        disbursed: totalDisbursed,
        remaining: projectData.budget - totalDisbursed,
      });
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
