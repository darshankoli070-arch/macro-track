import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setCheckEmail(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p>We sent a confirmation link to <strong>{email}</strong>. Click it, then come back here and log in.</p>
          <button className="auth-btn" onClick={() => { setCheckEmail(false); setMode("login"); }}>Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>NutriTrack</h1>
        <p className="auth-sub">{mode === "login" ? "Log in to your account" : "Create your account"}</p>
        <label className="auth-field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
