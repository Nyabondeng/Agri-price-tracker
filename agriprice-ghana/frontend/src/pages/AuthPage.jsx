import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { firebaseConfigured } from "../services/firebase";

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        await registerWithEmail(form.fullName, form.email, form.password);
      } else {
        await loginWithEmail(form.email, form.password);
      }

      navigate("/");
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Authentication failed");
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (googleError) {
      setError(googleError.response?.data?.message || googleError.message || "Google sign-in failed");
    }
  }

  return (
    <section className="mx-auto max-w-xl card space-y-4">
      <h1 className="title-display text-3xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="text-slate-600">Access role-based tools for farmers, traders, consumers, and admins.</p>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            required
          />
        )}
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button className="w-full rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={!firebaseConfigured}
        className="w-full rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        Continue with Google
      </button>
      {!firebaseConfigured && (
        <p className="text-xs text-amber-800">
          Google sign-in is disabled until valid Firebase keys are added in <code>frontend/.env</code>.
        </p>
      )}

      <button
        type="button"
        onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
        className="text-sm font-semibold text-slate-700"
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </section>
  );
}
