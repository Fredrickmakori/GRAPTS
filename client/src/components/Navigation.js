import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import "../styles/Navigation.css";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardRoute = () => {
    const roleRoutes = {
      admin: "/admin",
      project_manager: "/projects",
      financial_officer: "/financial",
      auditor: "/auditor",
      citizen: "/citizen",
    };
    return roleRoutes[user.role] || "/dashboard";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>GRAPTS</h1>
        </div>

        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <button onClick={() => navigate(dashboardRoute())}>Dashboard</button>
          <button onClick={() => navigate("/projects")}>Projects</button>
          <button onClick={() => navigate("/reports")}>Reports</button>

          <div className="user-menu">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
    </nav>
  );
};
