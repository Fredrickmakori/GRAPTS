import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./services/AuthContext";
import { initFirebase } from "./services/api";
import { Navigation } from "./components/Navigation";
import { LoginPage } from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuditorDashboard } from "./pages/AuditorDashboard";
import { CitizenPortal } from "./pages/CitizenPortal";
import { ReportsPage } from "./pages/ReportsPage";
import "./App.css";

// Initialize Firebase on app start
initFirebase();

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor"
          element={
            <ProtectedRoute>
              <AuditorDashboard />
            </ProtectedRoute>
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
