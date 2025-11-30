const express = require("express");
const { db } = require("../config/firebase");
const { verifyAuditIntegrity } = require("../services/auditLog");
const { authMiddleware, requirePermission } = require("../middleware/auth");

const router = express.Router();

// Get audit logs for an entity
router.get(
  "/audit-logs",
  authMiddleware,
  requirePermission("audit_logs"),
  async (req, res) => {
    try {
      const { entity, entityId, limit = 50 } = req.query;

      let query = db.collection("audit_logs");

      if (entity) query = query.where("entity", "==", entity);
      if (entityId) query = query.where("entityId", "==", entityId);

      const snapshot = await query
        .orderBy("timestamp", "desc")
        .limit(parseInt(limit))
        .get();

      const logs = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Verify audit ledger integrity
router.get(
  "/audit-logs/verify/integrity",
  authMiddleware,
  requirePermission("audit_logs"),
  async (req, res) => {
    try {
      const result = await verifyAuditIntegrity();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get activity report (summary of all actions)
router.get(
  "/reports/activity",
  authMiddleware,
  requirePermission("audit_logs"),
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("audit_logs")
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();

      const actionCounts = {};
      const entityCounts = {};
      const userActions = {};

      snapshot.forEach((doc) => {
        const log = doc.data();

        // Count actions
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

        // Count entities
        entityCounts[log.entity] = (entityCounts[log.entity] || 0) + 1;

        // Count by user
        userActions[log.userId] = (userActions[log.userId] || 0) + 1;
      });

      res.json({
        actionCounts,
        entityCounts,
        userActions,
        totalLogs: snapshot.size,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get budget/fund allocation report
router.get("/reports/budget", authMiddleware, async (req, res) => {
  try {
    const projects = await db.collection("projects").get();
    const budgetReport = [];

    for (const projectDoc of projects.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();

      const disbursements = await db
        .collection("disbursements")
        .where("projectId", "==", projectId)
        .get();

      let totalApproved = 0;
      let totalPending = 0;
      let transactionCount = 0;

      disbursements.forEach((doc) => {
        const d = doc.data();
        transactionCount++;
        if (d.status === "Approved") {
          totalApproved += d.amount;
        } else if (d.status === "Pending") {
          totalPending += d.amount;
        }
      });

      budgetReport.push({
        projectId,
        projectName: projectData.name,
        totalBudget: projectData.budget,
        allocatedFunds: projectData.allocatedFunds || 0,
        approvedDisbursements: totalApproved,
        pendingDisbursements: totalPending,
        remainingBudget: projectData.budget - totalApproved,
        transactionCount,
        status: projectData.status,
      });
    }

    res.json(budgetReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
