/* ============================================================
   EditProfilePage.jsx – EduConnect Edit Profile
   Route: /profile/edit
   API: PATCH /api/v1/users/profile/
        POST  /api/v1/auth/password-change/
   ============================================================ */
import { useState } from "react";
import Navbar from "../components/Navbar";
import "./ProfilePages.css";

const SUBJECTS = [
  "Algorithms", "Data Structures", "Mathematics",
  "Databases", "Networks", "Operating Systems",
  "Software Engineering", "Machine Learning",
  "Web Development", "Computer Architecture",
];

const INITIAL = {
  first_name: "Mwai",
  last_name:  "Komo",
  email:      "mwai@university.ac.ke",
  bio:        "3rd year CS student passionate about algorithms and distributed systems.",
  subjects:   ["Algorithms", "Data Structures", "Networks"],
  initials:   "MK",
};

export default function EditProfilePage() {
  const [form, setForm]         = useState(INITIAL);
  const [pwdForm, setPwdForm]   = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd]   = useState({ current: false, new: false });
  const [saving, setSaving]     = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [toast, setToast]       = useState(null); // { type, message }
  const [profileError, setProfileError] = useState("");
  const [pwdError, setPwdError]         = useState("");

  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setPwd = (k, v) => setPwdForm((p) => ({ ...p, [k]: v }));

  const toggleSubject = (s) =>
    set("subjects", form.subjects.includes(s)
      ? form.subjects.filter((x) => x !== s)
      : [...form.subjects, s]
    );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Save profile ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setProfileError("First and last name are required.");
      return;
    }
    setProfileError("");
    setSaving(true);
    try {
      const res = await fetch("/api/v1/users/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name:  form.last_name,
          bio:        form.bio,
          subjects:   form.subjects,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Profile saved successfully.");
    } catch {
      showToast("error", "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPwd.length < 8) { setPwdError("New password must be at least 8 characters."); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError("Passwords do not match."); return; }
    setPwdError("");
    setSavingPwd(true);
    try {
      const res = await fetch("/api/v1/auth/password-change/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ old_password: pwdForm.current, new_password: pwdForm.newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdError(data?.old_password?.[0] || data?.detail || "Password change failed."); return; }
      setPwdForm({ current: "", newPwd: "", confirm: "" });
      showToast("success", "Password changed successfully.");
    } catch {
      setPwdError("Connection error. Please try again.");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <>
      <Navbar user={form} activePage="profile" />

      {/* Toast */}
      {toast && (
        <div className={`ec-toast ec-toast--${toast.type}`} role="alert">
          {toast.type === "success"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.message}
        </div>
      )}

      <main className="ec-page">
        <div className="ec-page-inner edit-profile-layout">

          {/* Page header */}
          <div className="edit-profile-header">
            <div>
              <h1 className="edit-profile-title">Edit profile</h1>
              <p className="edit-profile-subtitle">Update your personal details and preferences</p>
            </div>
            <a href="/profile" className="btn btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Back to profile
            </a>
          </div>

          {/* ── Section 1: Personal info ── */}
          <div className="ec-card edit-section">
            <h2 className="edit-section-title">Personal information</h2>
            <p className="edit-section-desc">Your name and bio are visible to other students on your public profile.</p>

            {profileError && (
              <div className="ec-alert ec-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} noValidate>
              {/* Avatar preview */}
              <div className="edit-avatar-row">
                <div className="avatar av-indigo edit-avatar">{form.initials}</div>
                <div>
                  <p className="edit-avatar-name">{form.first_name} {form.last_name}</p>
                  <p className="ec-input-hint">Your initials are auto-generated from your name</p>
                </div>
              </div>

              <div className="edit-name-grid">
                <div className="ec-input-group">
                  <label className="ec-label" htmlFor="ep-first">First name</label>
                  <input id="ep-first" type="text" className="ec-input"
                    value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
                </div>
                <div className="ec-input-group">
                  <label className="ec-label" htmlFor="ep-last">Last name</label>
                  <input id="ep-last" type="text" className="ec-input"
                    value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="ep-email">Email address</label>
                <input id="ep-email" type="email" className="ec-input"
                  value={form.email} disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }} />
                <span className="ec-input-hint">Email address cannot be changed. Contact support if needed.</span>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="ep-bio">Bio</label>
                <textarea id="ep-bio" className="ec-input edit-bio-input"
                  placeholder="Tell other students a little about yourself…"
                  value={form.bio} onChange={(e) => set("bio", e.target.value)}
                  maxLength={280} />
                <span className="ec-input-hint" style={{ textAlign: "right" }}>
                  {form.bio.length} / 280
                </span>
              </div>

              {/* Subject interests */}
              <div className="ec-input-group">
                <label className="ec-label">Subject interests</label>
                <p className="ec-input-hint" style={{ marginBottom: 10 }}>
                  Select subjects you study — used to match you with questions and study groups.
                </p>
                <div className="edit-subject-grid">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`auth-subject-chip ${form.subjects.includes(s) ? "selected" : ""}`}
                      onClick={() => toggleSubject(s)}
                    >
                      {form.subjects.includes(s) && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="edit-form-actions">
                <a href="/profile" className="btn btn-ghost">Discard changes</a>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="ec-spinner" />Saving…</> : "Save changes"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Section 2: Password ── */}
          <div className="ec-card edit-section">
            <h2 className="edit-section-title">Change password</h2>
            <p className="edit-section-desc">Choose a strong password with at least 8 characters.</p>

            {pwdError && (
              <div className="ec-alert ec-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} noValidate style={{ maxWidth: 420 }}>
              <div className="ec-input-group">
                <label className="ec-label" htmlFor="cur-pwd">Current password</label>
                <div className="ec-input-icon-wrap">
                  <input id="cur-pwd" type={showPwd.current ? "text" : "password"} className="ec-input"
                    placeholder="Your current password"
                    value={pwdForm.current} onChange={(e) => setPwd("current", e.target.value)} required />
                  <button type="button" className="ec-input-icon-btn"
                    onClick={() => setShowPwd((p) => ({ ...p, current: !p.current }))}>
                    {showPwd.current
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="new-pwd-ep">New password</label>
                <div className="ec-input-icon-wrap">
                  <input id="new-pwd-ep" type={showPwd.new ? "text" : "password"} className="ec-input"
                    placeholder="At least 8 characters"
                    value={pwdForm.newPwd} onChange={(e) => setPwd("newPwd", e.target.value)} required />
                  <button type="button" className="ec-input-icon-btn"
                    onClick={() => setShowPwd((p) => ({ ...p, new: !p.new }))}>
                    {showPwd.new
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="ec-input-group">
                <label className="ec-label" htmlFor="confirm-pwd-ep">Confirm new password</label>
                <input id="confirm-pwd-ep" type="password" className="ec-input"
                  placeholder="Repeat new password"
                  value={pwdForm.confirm} onChange={(e) => setPwd("confirm", e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                {savingPwd ? <><span className="ec-spinner" />Updating…</> : "Update password"}
              </button>
            </form>
          </div>

          {/* ── Section 3: Danger zone ── */}
          <div className="ec-card edit-section edit-danger-section">
            <h2 className="edit-section-title edit-section-title--danger">Danger zone</h2>
            <p className="edit-section-desc">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button className="btn btn-danger" onClick={() => alert("Contact support to delete your account.")}>
              Delete account
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
