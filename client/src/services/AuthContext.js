import React, { useContext, useEffect, useState } from "react";
import { initFirebase } from "./api";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
    // Move async work into inner function to avoid making the effect callback async
    const init = async () => {
      // If there's a stored ID token, validate with backend to populate user info
      // Handle redirect result (Google sign-in) if present
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          const idToken = await redirectResult.user.getIdToken();
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
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(data.token || idToken);
            localStorage.setItem("token", data.token || idToken);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore redirect result errors — continue with normal bootstrap
      }

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
      let cred;
      try {
        cred = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        // Handle popup errors (blocked, closed, cancelled)
        const code = popupErr && popupErr.code;
        if (
          code === "auth/popup-blocked" ||
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request"
        ) {
          // Attempt redirect fallback which works when popups are blocked
          try {
            await signInWithRedirect(auth, provider);
            // Redirecting — exit handler (the app will unload)
            return;
          } catch (redirectErr) {
            // If redirect also fails, rethrow a friendly message
            throw new Error(
              "Popup sign-in failed and redirect fallback failed. Please enable popups or try another browser."
            );
          }
        } else {
          // Use redirect-based sign-in to avoid popup blockers and pending-promise issues
          await signInWithRedirect(auth, provider);
          // The redirect will unload the app; completion is handled in bootstrap via getRedirectResult
          return;
        }
      }
      // If popup sign-in succeeded, you may want to handle the credential here (optional)
      // For now, do nothing as redirect/popup completion is handled in bootstrap
    } finally {
      setLoading(false);
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
