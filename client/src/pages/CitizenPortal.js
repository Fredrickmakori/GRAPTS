import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
// Navbar is rendered globally by `Navigation` when a user is present
import KpiCard from "../components/KpiCard";

const CitizenPortal = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchPublicProjects = async () => {
    try {
      const data = await api.fetchProjects(token);
      const publicProjects = Array.isArray(data)
        ? data.filter((p) => p.status !== "Pending")
        : [];
      setProjects(publicProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-page-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Public Project Portal</h1>
            <p className="text-sm text-slate-600">
              View Government Projects & Budgets
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Projects" value={projects.length} />
          <KpiCard title="Total Budget" value="KSh 3.2B" />
          <KpiCard title="Completed" value="14" />
          <KpiCard title="Open Complaints" value="7" />
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No active projects available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id || project.name}
                  className="bg-white rounded-lg p-4 shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-slate-600">
                        {project.description}
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-slate-500">Budget</div>
                          <div className="font-medium">
                            KSh {(project.budget || 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Status</div>
                          <div className="font-medium">{project.status}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Location</div>
                          <div className="font-medium">
                            {project.location || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button className="px-3 py-2 bg-brand-500 text-white rounded">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CitizenPortal;
