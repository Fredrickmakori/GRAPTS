// src/components/FileUpload.js
import React, { useState } from "react";
import { useAuth } from "../services/AuthContext";

export const FileUpload = ({ projectId, milestoneId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const upload = async () => {
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;

      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000/api"
          }/upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type,
              base64,
              projectId,
              milestoneId,
            }),
          }
        );

        const data = await res.json();
        setUploading(false);
        setFile(null);
        onUploaded?.(data);
      } catch (err) {
        console.error("Upload error", err);
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-card neon-border p-4 rounded-lg text-white">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3"
      />

      <button
        onClick={upload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded shadow-md"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  );
};
