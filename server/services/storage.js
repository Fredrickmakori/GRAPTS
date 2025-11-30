const { admin, db } = require("../config/firebase");
const path = require("path");

const bucket = admin.storage().bucket();

// Upload a buffer to Firebase Storage and create a documents record in Firestore
async function uploadFileBuffer({
  buffer,
  fileName,
  contentType = "application/octet-stream",
  projectId = null,
  milestoneId = null,
  uploadedBy,
}) {
  try {
    const destPath = `documents/${Date.now()}_${fileName}`;
    const file = bucket.file(destPath);

    await file.save(buffer, {
      metadata: {
        contentType,
      },
    });

    // Make file public readable URL (optional) or use signed URLs in production
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;

    const docData = {
      projectId,
      milestoneId,
      fileName,
      storagePath: destPath,
      publicUrl,
      fileType: contentType,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("documents").add(docData);
    return { success: true, id: docRef.id, doc: docData };
  } catch (err) {
    console.error("Storage upload error:", err);
    return { success: false, error: err.message };
  }
}

module.exports = { uploadFileBuffer };
