import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import "../styles/Dashboard.css";

export const CitizenPortal = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProjects();
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Public Project Portal</h1>
        <p>View Government Projects & Budgets</p>
      </div>

      <div className="dashboard-content">
        <section className="citizen-section">
          <h2>Active Projects</h2>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No active projects available.</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="citizen-project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="project-stats">
                    <div>
                      <label>Total Budget</label>
                      <p className="amount">
                        ${(project.budget || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label>Status</label>
                      <p className="status">{project.status}</p>
                    </div>
                    <div>
                      <label>Location</label>
                      <p>{project.location || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
