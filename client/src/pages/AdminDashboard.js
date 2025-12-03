// src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import KpiCard from "../components/KpiCard";
import MapWrapper from "../components/MapWrapper";
import ProjectTable from "../components/ProjectTable";
import ActivityFeed from "../components/ActivityFeed";
import Modal from "../components/Modal";
import { ToastProvider, useToast } from "../components/Toast";
import { fetchProjects, fetchProjectById } from "../services/api"; // implement these

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <AdminDashboardInner />
    </ToastProvider>
  );
}

function AdminDashboardInner() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    let mounted = true;
    fetchProjects()
      .then((res) => mounted && setProjects(res || []))
      .catch((err) => {
        console.error(err);
        show?.("Could not load projects", { type: "error" });
      });
    return () => (mounted = false);
  }, [show]);

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const avgProgress = projects.length
    ? Math.round(
        projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length
      )
    : 0;

  async function openDetails(project) {
    try {
      const full = await fetchProjectById(project.id); // adapt if name differs
      setSelected(full || project);
      setDetailOpen(true);
    } catch (err) {
      console.error(err);
      show("Unable to load project details", { type: "error" });
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
          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Total Projects" value={projects.length} />
            <KpiCard title="Total Budget (KSh)" value={totalBudget} />
            <KpiCard title="Avg Progress (%)" value={avgProgress} />
          </div>

          {/* Map + Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96">
              <div className="glass-card p-3 rounded-xl h-full">
                <MapWrapper
                  markers={projects.map((p) => ({
                    id: p.id,
                    lat: p.latitude || p.lat || p.location?.lat,
                    lng: p.longitude || p.lng || p.location?.lng,
                    title: p.name,
                    subtitle: p.county,
                    who: p.who,
                    what: p.what,
                    where: p.where,
                    when: p.when,
                    why: p.why,
                  }))}
                  onMarkerClick={(m) => {
                    const project = projects.find((x) => x.id === m.id);
                    if (project) openDetails(project);
                  }}
                />
              </div>
            </div>

            <div>
              <ProjectTable projects={projects} onView={openDetails} />
            </div>
          </div>

          {/* Activity + selected details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {selected ? (
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selected.name}</h3>
                      <p className="text-sm text-slate-200 mt-2">
                        {selected.description}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white/5 rounded">
                          Who: {selected.who}
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          What: {selected.what}
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          Where: {selected.where}
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          When: {selected.when}
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          Why: {selected.why}
                        </div>
                      </div>
                    </div>

                    <div className="w-40 text-right">
                      <div className="text-sm">Budget</div>
                      <div className="font-bold text-cyan-300">
                        KSh {selected.budget?.toLocaleString()}
                      </div>
                      <div className="mt-3">Progress: {selected.progress}%</div>
                      <button
                        onClick={() => setDetailOpen(true)}
                        className="mt-4 px-3 py-2 bg-brand-600 rounded text-white"
                      >
                        View full
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-slate-300">
                    Select a project to view the 5 W’s and full details.
                  </div>
                </div>
              )}
            </div>

            <div>
              <ActivityFeed
                activities={projects.flatMap((p) =>
                  (p.activities || []).slice(0, 3)
                )}
              />
            </div>
          </div>
        </main>
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name || "Project"}
      >
        {selected ? (
          <div>
            <div className="text-sm text-slate-200 mb-2">
              {selected.description}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs text-slate-300 mb-1">Who</h4>
                <div className="p-2 bg-white/5 rounded">{selected.who}</div>
              </div>
              <div>
                <h4 className="text-xs text-slate-300 mb-1">What</h4>
                <div className="p-2 bg-white/5 rounded">{selected.what}</div>
              </div>
              <div>
                <h4 className="text-xs text-slate-300 mb-1">Where</h4>
                <div className="p-2 bg-white/5 rounded">{selected.where}</div>
              </div>
              <div>
                <h4 className="text-xs text-slate-300 mb-1">When</h4>
                <div className="p-2 bg-white/5 rounded">{selected.when}</div>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-xs text-slate-300 mb-1">Why</h4>
                <div className="p-2 bg-white/5 rounded">{selected.why}</div>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold">Milestones</h4>
              <ul className="mt-2 text-sm">
                {(selected.milestones || []).map((m, i) => (
                  <li key={i} className="py-1">
                    • {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-slate-300">No details</div>
        )}
      </Modal>
    </div>
  );
}
