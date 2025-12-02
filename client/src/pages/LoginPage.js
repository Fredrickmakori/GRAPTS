import React, { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // login | signup
  const [message, setMessage] = useState("");
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await signup(email, password, displayName || undefined);
      setMessage(res.message || "Verification email sent. Please check inbox.");
      setMode("login");
      // Redirect to the login page so the user can sign in after verifying email
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setMessage("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>GRAPTS</h1>
        <p className="subtitle">
          Government Resource Allocation & Project Tracking
        </p>

        {mode === "login" ? (
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
        ) : (
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
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
            <button type="submit">Create account</button>
          </form>
        )}

        <div className="divider">or</div>

        <button className="google-btn" onClick={handleGoogle}>
          Continue with Google
        </button>

        <div className="auth-footer">
          {mode === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button onClick={() => setMode("signup")}>Sign up</button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setMode("login")}>Sign in</button>
            </p>
          )}
        </div>

        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="demo-info">Demo: You can sign up with email or Google.</p>
      </div>
    </div>
  );
};
