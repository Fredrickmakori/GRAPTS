const express = require("express");
const { authMiddleware, requirePermission } = require("../middleware/auth");
const { uploadFileBuffer } = require("../services/storage");
const { logAuditAction } = require("../services/auditLog");

const router = express.Router();

// POST /api/upload
// Body: { fileName, contentType, base64, projectId?, milestoneId? }
router.post(
  "/upload",
  authMiddleware,
  requirePermission("upload_documents"),
  async (req, res) => {
    try {
      const {
        fileName,
        contentType = "application/octet-stream",
        base64,
        projectId = null,
        milestoneId = null,
      } = req.body;

      if (!fileName || !base64)
        return res
          .status(400)
          .json({ error: "fileName and base64 are required" });

      // Convert base64 to buffer
      const matches = base64.match(/^data:(.+);base64,(.+)$/);
      let buffer;
      let detectedType = contentType;
      if (matches) {
        detectedType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(base64, "base64");
      }

      const uploadResult = await uploadFileBuffer({
        buffer,
        fileName,
        contentType: detectedType,
        projectId,
        milestoneId,
        uploadedBy: req.user.uid,
      });

      if (!uploadResult.success)
        return res.status(500).json({ error: uploadResult.error });

      // Log audit
      await logAuditAction(
        "UPLOAD",
        "document",
        uploadResult.id,
        req.user.uid,
        req.user.role,
        { fileName, projectId, milestoneId }
      );

      res.json({ id: uploadResult.id, ...uploadResult.doc });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
