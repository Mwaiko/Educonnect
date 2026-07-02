import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./profilepage.css"; // Ensure this import points to your new CSS file

const ROLE_LABELS = { student: "Student", expert_solver: "Expert Solver" };

const profileApi = {
  get: () => api.get("/users/profile/").then((r) => r.data),
  update: (payload) => api.patch("/users/profile/", payload).then((r) => r.data),
  changePassword: (payload) => api.post("/auth/password-change/", payload).then((r) => r.data),
};

// Subjects are now the top-level "category" tags from the shared tag
// taxonomy (see apps/tag) instead of a hardcoded list. No query params
// returns top-level categories by default — see apps/tag/views.py.
const tagApi = {
  listSubjectOptions: () => api.get("/tags/").then((r) => r.data),
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
    <div className="hero-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function Pill({ label, tone = "light" }) {
  return (
    <span className={`pill ${tone === "light" ? "pill-light" : "pill-colored"}`}>
      {label}
    </span>
  );
}

function Badge({ label }) {
  return <span className="badge">{label}</span>;
}

function SubjectToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`subject-toggle ${active ? "active" : ""}`}
    >
      {active && <span className="subject-check">✓</span>}
      {label}
    </button>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div className={`info-row ${last ? "last" : ""}`}>
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function StatTile({ icon, label, value, color }) {
  return (
    <div className="stat-tile" style={{ borderTopColor: color }}>
      <div className="stat-icon-wrapper" style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button className="btn-primary" {...props}>
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button className="btn-secondary" {...props}>
      {children}
    </button>
  );
}

function ErrorText({ text }) {
  if (!text) return null;
  return <div className="error-text">{text}</div>;
}

function SuccessBanner({ text }) {
  return (
    <div className="success-banner">
      <span>✓</span>{text}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT — My Profile
// ═════════════════════════════════════════════════════════════════════════════
export default function ProfilePage() {
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

  // Available subject tags to choose from while editing (fetched from the
  // shared tag taxonomy — GET /tags/ with no params returns top-level
  // categories, which is what "subjects" means on the User model).
  const [subjectOptions, setSubjectOptions] = useState([]);

  // `profile.subjects` (from the API) is a list of full tag objects
  // ({id, name, slug, level, parent, breadcrumb}), but the PATCH payload
  // expects just a list of tag ids (UpdateProfileSerializer.subjects is a
  // PrimaryKeyRelatedField). So form.subjects stores ids only, and we look
  // the full objects up in subjectOptions when we need to render a label.
  const idsOf = (subjects) => (subjects || []).map((s) => s.id);

  const load = () => {
    setStatus("loading");
    Promise.all([profileApi.get(), tagApi.listSubjectOptions()])
      .then(([data, tags]) => {
        setProfile(data);
        setSubjectOptions(tags || []);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          subjects: idsOf(data.subjects),
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
      subjects: idsOf(profile.subjects),
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
      subjects: idsOf(profile.subjects),
    });
    setSaveError("");
    setEditing(false);
  };

  const toggleSubject = (id) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(id) ? f.subjects.filter(x => x !== id) : [...f.subjects, id],
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
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (status === "error" || !profile) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-title">Couldn't load your profile</div>
        <div className="error-desc">Check your connection and try again.</div>
        <PrimaryButton onClick={load}>Try again</PrimaryButton>
      </div>
    );
  }

  // ─── Ready ────────────────────────────────────────────────────────────────
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.email;

  return (
    <div className="profile-layout">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="hero-content">
          <HeroAvatar initials={getInitials(profile)} size={80} />
          <div className="hero-info">
            <div className="hero-title-group">
              <div className="hero-name">{fullName}</div>
              <Pill label={ROLE_LABELS[profile.role] || profile.role} />
            </div>
            <div className="hero-email">{profile.email}</div>
            <div className="hero-joined">
              <span>📅</span>Joined {formatJoined(profile)}
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="edit-profile-btn">
              ✏️ Edit profile
            </button>
          )}
        </div>
      </div>

      {saveSuccess && <SuccessBanner text="Profile updated." />}

      {/* Stats */}
      <div className="stats-grid">
        <StatTile icon="⭐" label="Points" value={profile.points_total ?? 0} color="var(--primary)" />
        <StatTile icon="🔥" label="Day streak" value={profile.streak_count ?? 0} color="var(--warning)" />
        <StatTile icon="🏆" label="Rank" value={profile.rank_position ? `#${profile.rank_position}` : "—"} color="var(--accent)" />
      </div>

      {/* Main grid */}
      <div className="main-grid">
        {/* Left column */}
        <div className="grid-column">
          <Card title="About">
            {editing ? (
              <div className="edit-form-group">
                <div className="edit-form-row">
                  <Field label="First name">
                    <input
                      className="form-input"
                      value={form.first_name}
                      onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      className="form-input"
                      value={form.last_name}
                      onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea
                    rows={4}
                    className="form-input textarea"
                    placeholder="Tell the community a bit about yourself…"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </Field>
              </div>
            ) : (
              <p className={`bio-text ${!profile.bio ? "empty" : ""}`}>
                {profile.bio || "No bio yet. Click Edit profile to add one."}
              </p>
            )}
          </Card>

          <Card title="Subjects" subtitle="Topics you're learning or can help others with">
            <div className="subjects-container">
              {editing ? (
                subjectOptions.map((tag) => (
                  <SubjectToggle
                    key={tag.id}
                    label={tag.name}
                    active={form.subjects.includes(tag.id)}
                    onClick={() => toggleSubject(tag.id)}
                  />
                ))
              ) : profile.subjects && profile.subjects.length > 0 ? (
                profile.subjects.map((s) => <Badge key={s.id} label={s.name} />)
              ) : (
                <span className="empty-subjects">No subjects added yet.</span>
              )}
            </div>
          </Card>

          {editing && (
            <div className="action-group">
              <div className="button-row">
                <PrimaryButton onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </PrimaryButton>
                <SecondaryButton onClick={cancelEdit} disabled={saving}>
                  Cancel
                </SecondaryButton>
              </div>
              <ErrorText text={saveError} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="grid-column right">
          <Card title="Account">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Role" value={ROLE_LABELS[profile.role] || profile.role} />
            <InfoRow label="Member since" value={formatJoined(profile)} last />
          </Card>

          <Card title="Password" subtitle="Keep your account secure">
            {!pwOpen ? (
              <SecondaryButton onClick={() => setPwOpen(true)}>Change password</SecondaryButton>
            ) : (
              <form onSubmit={handlePasswordChange} className="password-form">
                <Field label="Current password">
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={pwForm.old_password}
                    onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
                  />
                </Field>
                <Field label="New password">
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-input"
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                  />
                </Field>
                <Field label="Confirm new password">
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={pwForm.confirm_password}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
                  />
                </Field>
                <ErrorText text={pwError} />
                {pwSuccess && <div className="password-success-msg">✓ Password updated.</div>}
                <div className="button-row">
                  <PrimaryButton type="submit" disabled={pwSaving}>
                    {pwSaving ? "Updating…" : "Update password"}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={closePasswordForm} disabled={pwSaving}>
                    Cancel
                  </SecondaryButton>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}