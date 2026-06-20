import { useState, useEffect } from "react";
// NOTE: this file is expected to live at src/components/profile/ProfilePage.jsx,
// one level deeper than dashboard.jsx (which imports api from "../api/axios").
// Adjust this path if your folder layout differs.
import api from "../../api/axios";

// ═════════════════════════════════════════════════════════════════════════════
//  Mirrors apps/users/models.py — keep in sync with the backend.
// ═════════════════════════════════════════════════════════════════════════════
const SUBJECTS = [
  "Algorithms", "Data Structures", "Mathematics", "Databases", "Networks",
  "Operating Systems", "Software Engineering", "Machine Learning",
  "Web Development", "Computer Architecture",
];

const ROLE_LABELS = { student: "Student", expert_solver: "Expert Solver" };

// ═════════════════════════════════════════════════════════════════════════════
//  API
//  GET   /api/v1/users/profile/  → full profile incl. stats
//  PATCH /api/v1/users/profile/  → { first_name, last_name, bio, subjects }
//  POST  /api/v1/auth/password-change/ → { old_password, new_password }
//  The password-change field names are a best guess — confirm they match
//  PasswordChangeSerializer and adjust if needed.
// ═════════════════════════════════════════════════════════════════════════════
const profileApi = {
  get: () => api.get("/users/profile/").then(r => r.data),
  update: (payload) => api.patch("/users/profile/", payload).then(r => r.data),
  changePassword: (payload) => api.post("/auth/password-change/", payload).then(r => r.data),
};

function getInitials(p) {
  if (p.initials) return p.initials;
  const a = (p.first_name || "?")[0] || "?";
  const b = (p.last_name || "")[0] || "";
  return (a + b).toUpperCase();
}

function formatJoined(p) {
  if (p.joined_date) return p.joined_date;
  if (!p.date_joined) return "—";
  try {
    return new Date(p.date_joined).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

function extractErrorMessage(err, fallback) {
  const detail = err?.response?.data;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (detail.detail) return detail.detail;
  const flat = Object.values(detail).flat().filter(Boolean);
  return flat.length ? flat.join(" ") : fallback;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Small shared bits (kept local so this file can drop in on its own)
// ═════════════════════════════════════════════════════════════════════════════
function HeroAvatar({ initials, size = 80 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "rgba(255,255,255,0.16)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700,
      border: "3px solid rgba(255,255,255,0.35)",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function Pill({ label, C, tone = "light" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "4px 12px", borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      background: tone === "light" ? "rgba(255,255,255,0.18)" : C.primaryLight,
      color: tone === "light" ? "#fff" : C.primary,
      border: tone === "light" ? "1px solid rgba(255,255,255,0.25)" : "none",
    }}>{label}</span>
  );
}

function Badge({ label, C }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "5px 12px", borderRadius: 99,
      fontSize: 12, fontWeight: 500,
      background: C.primaryLight, color: C.primary,
    }}>{label}</span>
  );
}

function SubjectToggle({ label, active, onClick, C }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 13px", borderRadius: 99,
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        border: `1px solid ${active ? C.primary : C.border}`,
        background: active ? C.primary : "transparent",
        color: active ? "#fff" : C.textSecondary,
        transition: "all 0.15s ease",
      }}
    >
      {active && <span style={{ fontSize: 11 }}>✓</span>}
      {label}
    </button>
  );
}

function Card({ title, subtitle, children, C }) {
  return (
    <div style={{
      background: C.surfaceElevated, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 20, boxShadow: C.cardShadow,
    }}>
      {title && (
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "inherit", opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ label, value, C, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: last ? "none" : `1px solid ${C.border}`,
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: C.textSecondary }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function StatTile({ icon, label, value, color, C }) {
  return (
    <div style={{
      background: C.surfaceElevated, border: `1px solid ${C.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 12, boxShadow: C.cardShadow,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function inputStyle(C) {
  return {
    padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.inputBg, color: C.text, fontSize: 13, fontFamily: "inherit",
    outline: "none", width: "100%", boxSizing: "border-box",
  };
}

function PrimaryButton({ children, C, ...props }) {
  return (
    <button {...props} style={{
      padding: "10px 18px", borderRadius: 10, border: "none",
      background: C.primary, color: "#fff", fontSize: 13, fontWeight: 600,
      cursor: props.disabled ? "default" : "pointer", opacity: props.disabled ? 0.6 : 1,
      transition: "all 0.2s ease",
    }}>{children}</button>
  );
}

function SecondaryButton({ children, C, ...props }) {
  return (
    <button {...props} style={{
      padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`,
      background: "transparent", color: C.text, fontSize: 13, fontWeight: 600,
      cursor: props.disabled ? "default" : "pointer", opacity: props.disabled ? 0.6 : 1,
      transition: "all 0.2s ease",
    }}>{children}</button>
  );
}

function ErrorText({ text, C }) {
  if (!text) return null;
  return (
    <div style={{
      fontSize: 12, color: C.danger, background: C.dangerLight,
      borderRadius: 8, padding: "8px 12px",
    }}>{text}</div>
  );
}

function SuccessBanner({ text, C }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: C.successLight, color: C.success,
      border: `1px solid ${C.success}30`, borderRadius: 12,
      padding: "10px 16px", fontSize: 13, fontWeight: 500,
    }}>
      <span>✓</span>{text}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT — My Profile
// ═════════════════════════════════════════════════════════════════════════════
export default function ProfilePage({ C }) {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ first_name: "", last_name: "", bio: "", subjects: [] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const load = () => {
    setStatus("loading");
    profileApi.get()
      .then(data => {
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          subjects: data.subjects || [],
        });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const startEdit = () => {
    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      bio: profile.bio || "",
      subjects: profile.subjects || [],
    });
    setSaveError("");
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      bio: profile.bio || "",
      subjects: profile.subjects || [],
    });
    setSaveError("");
    setEditing(false);
  };

  const toggleSubject = (s) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await profileApi.update(form);
      setProfile(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(extractErrorMessage(err, "Couldn't save your changes. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const closePasswordForm = () => {
    setPwOpen(false);
    setPwError("");
    setPwForm({ old_password: "", new_password: "", confirm_password: "" });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("New passwords don't match.");
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      await profileApi.changePassword({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess(true);
      setTimeout(closePasswordForm, 1800);
    } catch (err) {
      setPwError(extractErrorMessage(err, "Couldn't update your password."));
    } finally {
      setPwSaving(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 400, background: C.surfaceElevated, borderRadius: 16,
        border: `1px solid ${C.border}`, boxShadow: C.cardShadow,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: `3px solid ${C.border}`, borderTopColor: C.primary,
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (status === "error" || !profile) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 14, minHeight: 400, background: C.surfaceElevated, borderRadius: 16,
        border: `1px solid ${C.border}`, boxShadow: C.cardShadow, padding: 32, textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Couldn't load your profile</div>
        <div style={{ fontSize: 13, color: C.textSecondary, maxWidth: 320 }}>
          Check your connection and try again.
        </div>
        <PrimaryButton C={C} onClick={load}>Try again</PrimaryButton>
      </div>
    );
  }

  // ─── Ready ────────────────────────────────────────────────────────────────
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.email;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{
        background: C.gradientHero, borderRadius: 20, padding: "32px",
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}25, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <HeroAvatar initials={getInitials(profile)} size={80} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.3px" }}>{fullName}</div>
              <Pill label={ROLE_LABELS[profile.role] || profile.role} C={C} />
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{profile.email}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span>📅</span>Joined {formatJoined(profile)}
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 10,
                background: "rgba(255,255,255,0.14)", color: "#fff",
                fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >✏️ Edit profile</button>
          )}
        </div>
      </div>

      {saveSuccess && <SuccessBanner text="Profile updated." C={C} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <StatTile icon="⭐" label="Points" value={profile.points_total ?? 0} color={C.primary} C={C} />
        <StatTile icon="🔥" label="Day streak" value={profile.streak_count ?? 0} color={C.warning} C={C} />
        <StatTile icon="🏆" label="Rank" value={profile.rank_position ? `#${profile.rank_position}` : "—"} color={C.accent} C={C} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <Card title="About" C={C}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, color: C.text }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="First name">
                    <input
                      style={inputStyle(C)} value={form.first_name}
                      onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      style={inputStyle(C)} value={form.last_name}
                      onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea
                    rows={4} style={{ ...inputStyle(C), resize: "vertical" }}
                    placeholder="Tell the community a bit about yourself…"
                    value={form.bio}
                    onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                  />
                </Field>
              </div>
            ) : (
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: profile.bio ? C.text : C.textSecondary }}>
                {profile.bio || "No bio yet. Click Edit profile to add one."}
              </p>
            )}
          </Card>

          <Card title="Subjects" subtitle="Topics you're learning or can help others with" C={C}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {editing
                ? SUBJECTS.map(s => (
                    <SubjectToggle key={s} label={s} active={form.subjects.includes(s)} onClick={() => toggleSubject(s)} C={C} />
                  ))
                : (profile.subjects && profile.subjects.length > 0
                    ? profile.subjects.map(s => <Badge key={s} label={s} C={C} />)
                    : <span style={{ fontSize: 13, color: C.textSecondary }}>No subjects added yet.</span>
                  )}
            </div>
          </Card>

          {editing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <PrimaryButton C={C} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </PrimaryButton>
                <SecondaryButton C={C} onClick={cancelEdit} disabled={saving}>Cancel</SecondaryButton>
              </div>
              <ErrorText text={saveError} C={C} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0, maxWidth: 400 }}>
          <Card title="Account" C={C}>
            <InfoRow label="Email" value={profile.email} C={C} />
            <InfoRow label="Role" value={ROLE_LABELS[profile.role] || profile.role} C={C} />
            <InfoRow label="Member since" value={formatJoined(profile)} C={C} last />
          </Card>

          <Card title="Password" subtitle="Keep your account secure" C={C}>
            {!pwOpen ? (
              <SecondaryButton C={C} onClick={() => setPwOpen(true)}>Change password</SecondaryButton>
            ) : (
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 12, color: C.text }}>
                <Field label="Current password">
                  <input
                    type="password" required style={inputStyle(C)}
                    value={pwForm.old_password}
                    onChange={(e) => setPwForm(f => ({ ...f, old_password: e.target.value }))}
                  />
                </Field>
                <Field label="New password">
                  <input
                    type="password" required minLength={8} style={inputStyle(C)}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                  />
                </Field>
                <Field label="Confirm new password">
                  <input
                    type="password" required style={inputStyle(C)}
                    value={pwForm.confirm_password}
                    onChange={(e) => setPwForm(f => ({ ...f, confirm_password: e.target.value }))}
                  />
                </Field>
                <ErrorText text={pwError} C={C} />
                {pwSuccess && <div style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>✓ Password updated.</div>}
                <div style={{ display: "flex", gap: 10 }}>
                  <PrimaryButton type="submit" C={C} disabled={pwSaving}>
                    {pwSaving ? "Updating…" : "Update password"}
                  </PrimaryButton>
                  <SecondaryButton type="button" C={C} onClick={closePasswordForm} disabled={pwSaving}>Cancel</SecondaryButton>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}