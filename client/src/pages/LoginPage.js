import React, { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import "./LoginPage.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
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
    <div className="login-page">
      <div className="login-container">
        {/* Card Container */}
        <div className="login-card">
          {/* Logo / Header */}
          <div className="login-header">
            <h1 className="login-title">GRAPTS</h1>
            <p className="login-subtitle">
              Government Resource Allocation & Project Tracking
            </p>
          </div>

          {/* Forms */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="login-form slide-in-right">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />

              <button type="submit" className="login-btn login-btn-primary">
                Sign In
              </button>

              <button
                type="button"
                onClick={handleGoogle}
                className="login-btn login-btn-secondary"
              >
                <FcGoogle className="google-icon" /> Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="login-form slide-in-left">
              <input
                type="text"
                placeholder="Full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="login-input"
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />

              <button type="submit" className="login-btn login-btn-success">
                Create Account
              </button>
            </form>
          )}

          {/* Mode Switch */}
          <div className="login-mode-switch">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="login-mode-link"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="login-mode-link"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        {message && <p className="login-message-success">{message}</p>}
        {error && <p className="login-message-error">{error}</p>}
      </div>
    </div>
  );
};
