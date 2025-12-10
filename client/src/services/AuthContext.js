import React, { useContext, useEffect, useState } from "react";
import { initFirebase, checkRuntimeConfig, BASE_URL } from "./api";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // Initialize Firebase services
  const { auth } = initFirebase();

  useEffect(() => {
    // Run runtime checks to detect missing envs and provide helpful logs
    try {
      if (typeof window !== "undefined") checkRuntimeConfig();
    } catch (e) {}
    // Move async work into inner function to avoid making the effect callback async
    const init = async () => {
      const bootstrap = async () => {
        if (!token) return;
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          });
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

      await bootstrap();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Require email verification for newly created accounts
      if (!cred.user.emailVerified) {
        // Send a verification email and prompt the user to verify
        try {
          await sendEmailVerification(cred.user);
        } catch (e) {
          // ignore send failures
        }
        await firebaseSignOut(auth);
        setLoading(false);
        throw new Error(
          "Email not verified. A verification link was sent to your email."
        );
      }
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

  const signup = async (email, password, displayName) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch (e) {
          // ignore profile update failure
        }
      }
      await sendEmailVerification(cred.user);
      // Do not auto-login until email verified
      await firebaseSignOut(auth);
      setLoading(false);
      return { message: "Verification email sent. Please check your inbox." };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
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
      console.error("Google sign-in error:", err);
      throw err;
    }
  };

  const logout = (clearToken = true) => {
    firebaseSignOut(auth);
    setUser(null);
    if (clearToken) {
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
