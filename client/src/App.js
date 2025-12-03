import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./services/AuthContext";
import { initFirebase } from "./services/api";
import Navbar from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import CitizenPortal from "./pages/CitizenPortal";
import { ReportsPage } from "./pages/ReportsPage";
import "./App.css";

// Initialize Firebase on app start
initFirebase();

// Protect routes that require login
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Protect routes that require specific role
const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} />;
  }
  return children;
};

// Define public nav links for the landing page
const landingPageLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Navbar visible on all pages */}
      <Navbar
        links={!user ? landingPageLinks : []} // show landing links if not logged in
        ctaLabel={!user ? "Get Started" : "Dashboard"}
        // point to /login (signup shares the login page in this app)
        ctaHref={!user ? "/login" : "/dashboard"}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/auditor"
          element={
            <RoleProtectedRoute requiredRole="auditor">
              <AuditorDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/citizen"
          element={
            <ProtectedRoute>
              <CitizenPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
