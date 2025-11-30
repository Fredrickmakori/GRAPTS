const jwt = require("jsonwebtoken");
const { admin, db } = require("../config/firebase");

// RBAC: Role -> Permissions mapping
const rolePermissions = {
  admin: ["read", "write", "delete", "audit", "manage_users"],
  project_manager: ["read", "write", "manage_projects", "upload_documents"],
  financial_officer: ["read", "write", "manage_disbursements", "audit_logs"],
  auditor: ["read", "audit_logs", "verify_milestones"],
  citizen: ["read"],
};

// Middleware: Verify Firebase ID token (preferred) or fallback to server JWT
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  // Try verify Firebase ID token first
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Fetch role from Firestore users collection if present
    let role = "citizen";
    try {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data && data.role) role = data.role;
      } else if (decoded.role) {
        role = decoded.role;
      }
    } catch (err) {
      // ignore Firestore lookup errors and default to decoded role or citizen
      if (decoded.role) role = decoded.role;
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      role,
      displayName: decoded.name || decoded.displayName || null,
    };

    return next();
  } catch (firebaseErr) {
    // If Firebase verification failed, try server-side JWT for backward compatibility
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      return res
        .status(401)
        .json({ error: "Invalid token", details: jwtErr.message });
    }
  }
};

// Middleware: Check if user has required permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    const userRole = req.user?.role || "citizen";
    const permissions = rolePermissions[userRole] || [];

    if (!permissions.includes(permission)) {
      return res
        .status(403)
        .json({ error: `Permission denied. Required: ${permission}` });
    }
    next();
  };
};

// Generate JWT token for user (after successful login) — kept for compatibility
const generateToken = (uid, email, role, displayName) => {
  return jwt.sign({ uid, email, role, displayName }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = {
  authMiddleware,
  requirePermission,
  generateToken,
  rolePermissions,
};
