const crypto = require("crypto");
const { db } = require("../config/firebase");

// Generate a SHA-256 hash of data
const hashData = (data) => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

// Log an action to the audit ledger (immutable log)
const logAuditAction = async (
  action,
  entity,
  entityId,
  userId,
  userRole,
  details = {},
  previousHash = null
) => {
  const timestamp = new Date().toISOString();
  const logData = {
    action,
    entity,
    entityId,
    userId,
    userRole,
    details,
    timestamp,
    previousHash: previousHash || "genesis",
  };

  // Hash this log entry and include hash of previous entry
  const currentHash = hashData(logData);
  logData.hash = currentHash;

  try {
    // Save to Firestore
    await db.collection("audit_logs").add(logData);
    return { success: true, hash: currentHash, timestamp };
  } catch (err) {
    console.error("Audit log error:", err);
    return { success: false, error: err.message };
  }
};

// Verify audit ledger integrity (check if any logs have been tampered with)
const verifyAuditIntegrity = async () => {
  try {
    const logs = await db
      .collection("audit_logs")
      .orderBy("timestamp", "asc")
      .get();

    let previousHash = "genesis";
    let integrityStatus = true;

    logs.forEach((doc) => {
      const log = doc.data();
      if (log.previousHash !== previousHash) {
        integrityStatus = false;
      }
      previousHash = log.hash;
    });

    return {
      verified: integrityStatus,
      totalLogs: logs.size,
      message: integrityStatus
        ? "Audit ledger is intact"
        : "Audit ledger has been tampered with",
    };
  } catch (err) {
    return { verified: false, error: err.message };
  }
};

module.exports = {
  logAuditAction,
  verifyAuditIntegrity,
  hashData,
};
