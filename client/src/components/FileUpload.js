import React, { useState } from "react";
import { useAuth } from "../services/AuthContext";

export const FileUpload = ({
  projectId = null,
  milestoneId = null,
  onUploaded,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result; // includes data:type;base64,
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
        if (onUploaded) onUploaded(data);
      } catch (err) {
        console.error("Upload error", err);
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileChange} />
      <button onClick={upload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};
