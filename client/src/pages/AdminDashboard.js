import React, { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { api } from "../services/api";
import "../styles/Dashboard.css";

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: "",
  });

  useEffect(() => {
    fetchProjects();
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
      setProjects([...projects, response]);
      setNewProject({ name: "", description: "", budget: "" });
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      <div className="dashboard-content">
        <section className="form-section">
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Budget"
              value={newProject.budget}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  budget: parseFloat(e.target.value),
                })
              }
              required
            />
            <button type="submit">Create Project</button>
          </form>
        </section>

        <section className="projects-section">
          <h2>Projects ({projects.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Create one above.</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p>
                    <strong>Budget:</strong> ${project.budget}
                  </p>
                  <p>
                    <strong>Status:</strong> {project.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
