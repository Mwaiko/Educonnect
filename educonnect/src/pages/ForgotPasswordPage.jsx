/* ============================================================
   ForgotPasswordPage.jsx – EduConnect Password Reset
   Route: /forgot-password
   API: POST /api/v1/auth/password-reset/
        POST /api/v1/auth/password-reset/confirm/
   ============================================================ */
import { useState } from "react";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  // "request" | "sent" | "reset" | "done"
  const [stage, setStage]   = useState("request");
  const [email, setEmail]   = useState("");
  const [token, setToken]   = useState("");
  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  /* ── Stage 1: request reset email ── */
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show "sent" regardless of whether email exists (security best practice)
      if (res.ok || res.status === 400) setStage("sent");
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Stage 3: set new password ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/password-reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.detail || "Invalid or expired token."); return; }
      setStage("done");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-centered-card">
        {/* Brand */}
        <a href="/login" className="ec-brand auth-brand-center">
          <div className="ec-brand-logo">
            <div className="ec-brand-logo-inner"><div className="ec-brand-logo-dot" /></div>
          </div>
          <span className="ec-brand-name" style={{ color: "var(--ec-primary-dark)" }}>EduConnect</span>
        </a>

        {/* ── Stage: request ── */}
        {stage === "request" && (
          <>
            <div className="auth-form-header">
              <div className="auth-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="auth-form-title">Forgot your password?</h2>
              <p className="auth-form-subtitle">Enter your email address and we'll send you a reset link.</p>
            </div>

            {error && (
              <div className="ec-alert ec-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleRequest} noValidate>
              <div className="ec-input-group">
                <label className="ec-label" htmlFor="fp-email">Email address</label>
                <input id="fp-email" type="email" className="ec-input"
                  placeholder="you@university.ac.ke"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="ec-spinner" />Sending…</> : "Send reset link"}
              </button>
            </form>
          </>
        )}

        {/* ── Stage: sent ── */}
        {stage === "sent" && (
          <div className="auth-success-state">
            <div className="auth-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h2 className="auth-form-title">Check your email</h2>
            <p className="auth-form-subtitle">
              If <strong>{email}</strong> is registered, a password reset link has been sent. Check your inbox.
            </p>
            <div className="auth-sent-actions">
              <button
                className="btn btn-secondary btn-full"
                onClick={() => { setStage("reset"); setError(""); }}
              >
                I have a reset token
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setStage("request")}>
                Try a different email
              </button>
            </div>
          </div>
        )}

        {/* ── Stage: reset (enter token + new password) ── */}
        {stage === "reset" && (
          <>
            <div className="auth-form-header">
              <div className="auth-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 className="auth-form-title">Set a new password</h2>
              <p className="auth-form-subtitle">Enter the token from your email and choose a new password.</p>
            </div>

            {error && (
              <div className="ec-alert ec-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleReset} noValidate>
              <div className="ec-input-group">
                <label className="ec-label" htmlFor="reset-token">Reset token</label>
                <input id="reset-token" type="text" className="ec-input"
                  placeholder="Paste the token from your email"
                  value={token} onChange={(e) => setToken(e.target.value)} required />
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="new-pwd">New password</label>
                <div className="ec-input-icon-wrap">
                  <input id="new-pwd" type={showPwd ? "text" : "password"} className="ec-input"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="ec-input-icon-btn" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="confirm-pwd">Confirm new password</label>
                <input id="confirm-pwd" type="password" className="ec-input"
                  placeholder="Repeat new password"
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="ec-spinner" />Updating…</> : "Update password"}
              </button>
            </form>
          </>
        )}

        {/* ── Stage: done ── */}
        {stage === "done" && (
          <div className="auth-success-state">
            <div className="auth-success-icon auth-success-icon--green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="auth-form-title">Password updated</h2>
            <p className="auth-form-subtitle">Your password has been reset successfully. Sign in with your new credentials.</p>
            <a href="/login" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>
              Go to sign in
            </a>
          </div>
        )}

        <hr className="ec-divider" />
        <p className="auth-form-footer">
          <a href="/login" className="auth-link">← Back to sign in</a>
        </p>
      </div>
    </div>
  );
}
