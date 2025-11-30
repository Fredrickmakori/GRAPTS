import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import "../styles/Dashboard.css";

export const AuditorDashboard = () => {
  const { user, token } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  const fetchAuditLogs = async () => {
    try {
      const data = await api.fetchAuditLogs(token, { limit: 50 });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Auditor Dashboard</h1>
        <p>Audit Logs & Verification</p>
      </div>

      <div className="dashboard-content">
        <section className="audit-section">
          <h2>Recent Audit Logs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : auditLogs.length === 0 ? (
            <p>No audit logs available.</p>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Timestamp</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.entity}</td>
                    <td>{log.userId}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="hash">{log.hash?.substring(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};
