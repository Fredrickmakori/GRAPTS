import React, { useContext, useEffect, useState } from "react";
import { initFirebase } from "./api";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // Initialize Firebase services
  const { auth } = initFirebase();

  useEffect(() => {
    // If there's a stored ID token, validate with backend to populate user info
    const bootstrap = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:4000/api"
          }/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          }
        );
        if (!res.ok) throw new Error("Token validation failed");
        const data = await res.json();
        setUser(data.user);
        setToken(data.token || token);
        localStorage.setItem("token", data.token || token);
      } catch (err) {
        console.warn("Stored token invalid, clearing.", err.message);
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // Exchange ID token with backend to get user record (role, displayName)
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000/api"
        }/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Backend login failed");
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token || idToken);
      localStorage.setItem("token", data.token || idToken);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async (signOutFirebase = true) => {
    if (signOutFirebase && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        // ignore
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
