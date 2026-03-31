import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

import api, { setAuthToken } from "../services/api";
import { auth, firebaseConfigured, googleProvider } from "../services/firebase";

const AuthContext = createContext(null);

const STORAGE_KEY = "agriprice_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setToken(parsed.token || "");
      setUser(parsed.user || null);
      setAuthToken(parsed.token || "");
    } finally {
      setLoading(false);
    }
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);

    if (!nextToken) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  async function exchangeFirebaseToken(idToken, fullName = "") {
    const { data } = await api.post("/auth/firebase", { idToken, fullName });
    persist(data.token, data.user);
  }

  async function loginWithEmail(email, password) {
    if (!firebaseConfigured || !auth) {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data.token, data.user);
      return;
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    await exchangeFirebaseToken(idToken);
  }

  async function registerWithEmail(fullName, email, password) {
    if (!firebaseConfigured || !auth) {
      const { data } = await api.post("/auth/register", { fullName, email, password });
      persist(data.token, data.user);
      return;
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(result.user, { displayName: fullName });
    }
    const idToken = await result.user.getIdToken();
    await exchangeFirebaseToken(idToken, fullName);
  }

  async function loginWithGoogle() {
    if (!firebaseConfigured || !auth || !googleProvider) {
      throw new Error("Google sign-in is not configured yet. Add Firebase keys in frontend .env");
    }

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    await exchangeFirebaseToken(idToken);
  }

  async function refreshProfile() {
    if (!token) return;
    const { data } = await api.get("/auth/me");
    persist(token, data.user);
  }

  function logout() {
    persist("", null);
  }

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === "admin",
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    refreshProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
