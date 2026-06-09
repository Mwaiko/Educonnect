/* ============================================================
   RegisterPage.jsx – EduConnect New Account
   Route: /register
   API: POST /api/v1/auth/register/
   ============================================================ */
import { useState } from "react";
import "./AuthPages.css";

const SUBJECTS = [
  "Algorithms", "Data Structures", "Mathematics",
  "Databases", "Networks", "Operating Systems",
  "Software Engineering", "Machine Learning",
  "Web Development", "Computer Architecture",
];

const ROLES = [
  { value: "student",      label: "Student",       desc: "Browse, ask, and answer questions" },
  { value: "expert_solver", label: "Expert Solver", desc: "All student privileges + answer endorsement" },
];

export default function RegisterPage() {
  const [step, setStep]       = useState(1); // 2-step form
  const [form, setForm]       = useState({
    first_name: "", last_name: "", email: "",
    password: "", confirm_password: "",
    role: "student", subjects: [],
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const toggleSubject = (s) =>
    set("subjects", form.subjects.includes(s)
      ? form.subjects.filter((x) => x !== s)
      : [...form.subjects, s]
    );

  const validateStep1 = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return "Please enter your full name.";
    if (!form.email.includes("@")) return "Please enter a valid email address.";
    if (form.password.length < 8)  return "Password must be at least 8 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.subjects.length === 0) {
      setError("Please select at least one subject interest.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          password:   form.password,
          role:       form.role,
          subjects:   form.subjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.email?.[0] || data?.detail || "Registration failed. Please try again.");
        return;
      }

      window.location.href = "/login?registered=true";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left hero */}
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
            Your academic<br />community awaits.
          </h1>
          <p className="auth-hero-sub">
            Join thousands of students sharing knowledge, earning streak badges, and forming study groups around their courses.
          </p>

          {/* Feature list */}
          <div className="auth-features">
            {[
              { icon: "💬", text: "Ask and answer academic questions" },
              { icon: "🔥", text: "Build daily learning streaks" },
              { icon: "👥", text: "Auto-matched study groups" },
              { icon: "📚", text: "Community-ranked resources" },
            ].map((f) => (
              <div className="auth-feature" key={f.text}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-card">
          {/* Step indicator */}
          <div className="auth-steps">
            {[1, 2].map((n) => (
              <div key={n} className={`auth-step ${step >= n ? "active" : ""} ${step > n ? "done" : ""}`}>
                <div className="auth-step-dot">
                  {step > n ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : n}
                </div>
                <span className="auth-step-label">{n === 1 ? "Account" : "Interests"}</span>
              </div>
            ))}
            <div className="auth-step-line" style={{ width: step > 1 ? "100%" : "0%" }} />
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {step === 1 ? "Create your account" : "Choose your interests"}
            </h2>
            <p className="auth-form-subtitle">
              {step === 1
                ? "Start connecting with your academic community"
                : "We'll use these to match you with relevant questions and groups"}
            </p>
          </div>

          {error && (
            <div className="ec-alert ec-alert-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} noValidate>
              <div className="auth-name-row">
                <div className="ec-input-group">
                  <label className="ec-label" htmlFor="first_name">First name</label>
                  <input id="first_name" name="first_name" type="text" className="ec-input"
                    placeholder="Mwai" value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)} required />
                </div>
                <div className="ec-input-group">
                  <label className="ec-label" htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" type="text" className="ec-input"
                    placeholder="Komo" value={form.last_name}
                    onChange={(e) => set("last_name", e.target.value)} required />
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="reg-email">Email address</label>
                <input id="reg-email" name="email" type="email" className="ec-input"
                  placeholder="you@university.ac.ke" value={form.email}
                  onChange={(e) => set("email", e.target.value)} required />
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="reg-password">Password</label>
                <div className="ec-input-icon-wrap">
                  <input id="reg-password" name="password" type={showPwd ? "text" : "password"}
                    className="ec-input" placeholder="At least 8 characters"
                    value={form.password} onChange={(e) => set("password", e.target.value)} required />
                  <button type="button" className="ec-input-icon-btn"
                    onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password">
                    {showPwd
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="confirm_password">Confirm password</label>
                <input id="confirm_password" name="confirm_password" type="password"
                  className="ec-input" placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={(e) => set("confirm_password", e.target.value)} required />
              </div>

              {/* Role selection */}
              <div className="ec-input-group">
                <label className="ec-label">Account type</label>
                <div className="auth-role-cards">
                  {ROLES.map((r) => (
                    <label key={r.value} className={`auth-role-card ${form.role === r.value ? "selected" : ""}`}>
                      <input type="radio" name="role" value={r.value}
                        checked={form.role === r.value}
                        onChange={() => set("role", r.value)} />
                      <div>
                        <span className="auth-role-name">{r.label}</span>
                        <span className="auth-role-desc">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-subject-grid">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`auth-subject-chip ${form.subjects.includes(s) ? "selected" : ""}`}
                    onClick={() => toggleSubject(s)}
                  >
                    {form.subjects.includes(s) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {s}
                  </button>
                ))}
              </div>

              <p className="auth-subject-count">
                {form.subjects.length === 0
                  ? "Select subjects you study or teach"
                  : `${form.subjects.length} subject${form.subjects.length > 1 ? "s" : ""} selected`}
              </p>

              <div className="auth-step2-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setError(""); }}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? <><span className="ec-spinner" />Creating account…</> : "Create account"}
                </button>
              </div>
            </form>
          )}

          <hr className="ec-divider" />
          <p className="auth-form-footer">
            Already have an account?{" "}
            <a href="/login" className="auth-link auth-link--bold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
