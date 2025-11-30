import React, { useState } from "react";
import { useAuth } from "../services/AuthContext";
import "../styles/Auth.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // In production, use Firebase authentication
      const firebaseUser = {
        uid: "test-user-123",
        email,
        role: "admin",
        displayName: email,
      };
      login(firebaseUser);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>GRAPTS Login</h1>
        <p className="subtitle">
          Government Resource Allocation & Project Tracking
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="demo-info">Demo: Use any email & password to test.</p>
      </div>
    </div>
  );
};
