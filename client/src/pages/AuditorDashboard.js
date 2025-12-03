// src/pages/AuditorDashboard.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProjectTable from "../components/ProjectTable";
import Modal from "../components/Modal";
import { ToastProvider, useToast } from "../components/Toast";
import { fetchProjects, verifyMilestone } from "../services/api"; // implement these

export default function AuditorDashboard() {
  return (
    <ToastProvider>
      <AuditorInner />
    </ToastProvider>
  );
}

function AuditorInner() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err) => {
        console.error(err);
        show("Failed to load projects", { type: "error" });
      });
  }, [show]);

  function openVerify(p) {
    setSelected(p);
    setModalOpen(true);
  }

  async function handleApprove() {
    try {
      await verifyMilestone(selected.id); // backend action
      show("Milestone approved", { type: "success" });
      setModalOpen(false);
      // refresh
      const nxt = await fetchProjects();
      setProjects(nxt);
    } catch (err) {
      console.error(err);
      show("Verification failed", { type: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-6 gap-6">
        <div className="lg:col-span-1">
          <Sidebar />
        </div>

        <main className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-semibold">Verification Queue</h2>

          <div>
            <ProjectTable projects={projects} onView={(p) => openVerify(p)} />
          </div>
        </main>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Verify Milestone"
      >
        <div>
          <div className="text-sm mb-3">
            Project: <strong>{selected?.name}</strong>
          </div>
          <div className="text-sm text-slate-300 mb-3">
            Evidence preview and description would appear here.
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-cyan-500 rounded text-black font-semibold"
            >
              Approve
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-white/5 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
