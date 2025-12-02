import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";

const AuditorDashboard = () => {
  const { user, token } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-page-bg">
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Auditor Dashboard</h1>
              <p className="text-sm text-slate-600">
                Audit Logs & Verification
              </p>
            </div>
            <div>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-brand-500 text-white rounded"
              >
                Verify Milestones
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white rounded-lg p-4 shadow">
              <h2 className="font-semibold mb-4">Verification Queue</h2>
              <p className="text-sm text-slate-600">
                Tasks awaiting verification will appear here.
              </p>
            </section>

            <aside className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold">Recent Audit Logs</h3>
              {loading ? (
                <p className="text-sm">Loading...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm">No audit logs available.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {auditLogs.map((log) => (
                    <li key={log.id} className="border rounded p-2">
                      <div className="text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      <div className="font-medium">
                        {log.action} — {log.entity}
                      </div>
                      <div className="text-xs text-slate-600">
                        by {log.userId} • {log.hash?.substring(0, 8)}...
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </main>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Verify Milestone"
      >
        <p className="text-sm">
          Verification UI will allow viewing evidence and recording approval
          decisions.
        </p>
      </Modal>
    </div>
  );
};

export default AuditorDashboard;
