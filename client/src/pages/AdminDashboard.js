import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar";
import KpiCard from "../components/KpiCard";
import Modal from "../components/Modal";
import MapWrapper from "../components/MapWrapper";
import ProjectTable from "../components/ProjectTable";
import ActivityFeed from "../components/ActivityFeed";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProjects = async () => {
    try {
      const data = await api.fetchProjects(token);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
    setLoading(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createProject(newProject, token);
      setProjects((p) => [...p, response]);
      setNewProject({ name: "", description: "", budget: "" });
      setModalOpen(false);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      <div className="flex">
        <div className={`hidden md:block`}>
          <Sidebar />
        </div>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome, {user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-brand-500 text-white rounded"
              >
                New Project
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Projects" value={projects.length} />
            <KpiCard title="Funds Allocated" value="KSh 1.2B" />
            <KpiCard title="Pending Milestones" value="31" />
            <KpiCard title="Complaints" value="12" />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-4 shadow">
                <h2 className="font-semibold mb-4">Project Map</h2>
                {/* Map will receive markers from project locations (fallbacks if not present) */}
                <MapWrapper
                  markers={projects.map((p, idx) => ({
                    id: p.id || idx,
                    lat: p.lat || p.locationLat || -1.286389 + idx * 0.01,
                    lng: p.lng || p.locationLng || 36.817223 + idx * 0.01,
                    title: p.name,
                    subtitle: p.location || p.county || "Unknown",
                  }))}
                  height={360}
                  zoom={7}
                />
              </div>

              <ProjectTable
                projects={projects}
                onView={(p) => alert(`Open project ${p.name}`)}
              />
            </div>

            <aside>
              <ActivityFeed
                activities={projects.slice(0, 5).map((p, i) => ({
                  id: p.id || i,
                  timestamp: Date.now() - i * 60000,
                  message: `Project ${p.name} updated`,
                  user: p.owner || "system",
                }))}
              />
            </aside>
          </div>
        </main>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="number"
            placeholder="Budget"
            value={newProject.budget}
            onChange={(e) =>
              setNewProject({ ...newProject, budget: e.target.value })
            }
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-500 text-white rounded"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
