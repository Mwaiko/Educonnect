/* ============================================================
   LoginPage.jsx – EduConnect Authentication
   Route: /login
   API: POST /api/v1/auth/login/
   ============================================================ */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Invalid email or password.");
        return;
      }

      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel – hero */}
      <div className="auth-panel auth-panel--hero">
        <div className="auth-hero-content">
          <div className="ec-brand">
            <div className="ec-brand-logo">
              <div className="ec-brand-logo-inner">
                <div className="ec-brand-logo-dot" />
              </div>
            </div>
            <span className="ec-brand-name" style={{ color: "#fff" }}>EduConnect</span>
          </div>

          <h1 className="auth-hero-title">
            Learn together.<br />Grow faster.
          </h1>
          <p className="auth-hero-sub">
            A peer-to-peer platform where students share knowledge, earn streaks, and build academic momentum.
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in to continue your learning streak</p>
          </div>

          {error && (
            <div className="ec-alert ec-alert-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="ec-input-group">
              <label className="ec-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="ec-input"
                placeholder="you@university.ac.ke"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="ec-input-group">
              <label className="ec-label" htmlFor="password">Password</label>
              <div className="ec-input-icon-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  className="ec-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="ec-input-icon-btn"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-form-options">
              <label className="ec-checkbox-label">
                <input type="checkbox" className="ec-checkbox" />
                Remember me
              </label>
              <a href="/forgot-password" className="auth-link">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <><span className="ec-spinner" />Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <hr className="ec-divider" />

          <p className="auth-form-footer">
            New to EduConnect?{" "}
            <a href="/register" className="auth-link auth-link--bold">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}