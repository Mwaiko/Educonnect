import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import "./profilepage.css";

const ROLE_LABELS = { student: "Student", expert_solver: "Expert Solver" };

const profileApi = {
  get: () => api.get("/users/profile/").then((r) => r.data),
  update: (payload) => api.patch("/users/profile/", payload).then((r) => r.data),
  changePassword: (payload) => api.post("/auth/password-change/", payload).then((r) => r.data),
};

const tagApi = {
  listSubjectOptions: () => 
    api.get("/tags/?level=category").then((r) => r.data.results || r.data),
};
/* ═══════════════════════════════════════════════════════════════════════════
   Utility Helpers
═══════════════════════════════════════════════════════════════════════════ */

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
    return new Date(p.date_joined).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
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

/* ═══════════════════════════════════════════════════════════════════════════
   SVG Icons (inline, no external deps)
═══════════════════════════════════════════════════════════════════════════ */

const Icons = {
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  checkCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  star: "⭐",
  flame: "🔥",
  trophy: "🏆",
  user: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  key: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   Small Shared Components
═══════════════════════════════════════════════════════════════════════════ */

function HeroAvatar({ initials, size = 80 }) {
  return (
    <div
      className="hero-avatar"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={`Avatar with initials ${initials}`}
    >
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
      aria-pressed={active}
    >
      {active && <span className="subject-check">{Icons.check}</span>}
      {label}
    </button>
  );
}

function Card({ title, subtitle, children, action }) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <div>
            <div className="card-title">{title}</div>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error" style={{ fontSize: 12, color: "var(--ec-danger)", marginTop: 4 }}>{error}</span>}
    </label>
  );
}

function InfoRow({ label, value, last, icon }) {
  return (
    <div className={`info-row ${last ? "last" : ""}`}>
      <span className="info-label">
        {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
        {label}
      </span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function StatTile({ icon, label, value, color }) {
  return (
    <div className="stat-tile" style={{ borderTopColor: color }}>
      <div
        className="stat-icon-wrapper"
        style={{ background: `${color}18` }}
        aria-hidden="true"
      >
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
  return (
    <div className="error-text" role="alert">
      {Icons.alert}
      {text}
    </div>
  );
}

function SuccessBanner({ text, onDismiss }) {
  return (
    <div className="success-banner" role="status">
      {Icons.checkCircle}
      <span style={{ flex: 1 }}>{text}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: 2,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Animated Counter for Stats
═══════════════════════════════════════════════════════════════════════════ */

function useCountUp(end, duration = 800) {
  const [count, setCount] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    const startTime = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (end - startVal) * eased);
      setCount(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return count;
}

function AnimatedStat({ icon, label, value, color, isRank }) {
  const numericValue = isRank ? value : (typeof value === "number" ? value : 0);
  const animated = useCountUp(numericValue);
  const display = isRank ? value : animated;

  return (
    <StatTile
      icon={icon}
      label={label}
      value={display}
      color={color}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Password Strength Indicator
═══════════════════════════════════════════════════════════════════════════ */

function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = [
    "#EF4444",
    "#EF4444",
    "#F59E0B",
    "#06B6D4",
    "#10B981",
    "#10B981",
  ];

  if (!password) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= strength ? colors[strength] : "#E2E8F0",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[strength], fontWeight: 600 }}>
        {labels[strength]}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT — My Profile
═══════════════════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const { C } = useTheme();
  // Theme colors as inline CSS custom properties, following the same
  // pattern used by dashboard.jsx (e.g. .panel, .guest-feature-card) so
  // this page re-themes correctly on light/dark toggle instead of using
  // its own static palette.
  const themeVars = {
    "--bg": C.bg,
    "--surface-elevated": C.surfaceElevated,
    "--border": C.border,
    "--text": C.text,
    "--text-secondary": C.textSecondary,
    "--primary": C.primary,
    "--primary-light": C.primaryLight,
    "--primary-dark": C.primaryDark,
    "--accent": C.accent,
    "--success": C.success,
    "--success-light": C.successLight,
    "--warning": C.warning,
    "--warning-light": C.warningLight,
    "--danger": C.danger,
    "--card-shadow": C.cardShadow,
    "--hover-shadow": C.hoverShadow,
  };

  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    subjects: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const bioRef = useRef(null);

  const idsOf = (subjects) => (subjects || []).map((s) => s.id);

  const load = useCallback(() => {
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
  }, []);

  useEffect(() => load(), [load]);

  // Auto-focus bio textarea when entering edit mode
  useEffect(() => {
    if (editing && bioRef.current) {
      setTimeout(() => bioRef.current?.focus(), 100);
    }
  }, [editing]);

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
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(id)
        ? f.subjects.filter((x) => x !== id)
        : [...f.subjects, id],
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
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(
        extractErrorMessage(err, "Couldn't save your changes. Please try again.")
      );
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
      setTimeout(closePasswordForm, 2000);
    } catch (err) {
      setPwError(extractErrorMessage(err, "Couldn't update your password."));
    } finally {
      setPwSaving(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="profile-layout" style={themeVars}>
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">Loading your profile…</span>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────
  if (status === "error" || !profile) {
    return (
      <div className="profile-layout" style={themeVars}>
        <div className="error-container" role="alert">
          <div className="error-icon-wrap" aria-hidden="true">⚠️</div>
          <div className="error-title">Couldn't load your profile</div>
          <div className="error-desc">
            Something went wrong while fetching your profile data. Check your
            connection and try again.
          </div>
          <PrimaryButton onClick={load}>
            {Icons.refresh}
            Try again
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ─── Ready State ─────────────────────────────────────────────────────────
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.email;

  return (
    <div className="profile-layout" style={themeVars}>
      {/* ═══ Hero Section ═══ */}
      <div className="hero-section">
        <div className="hero-bg-overlay" aria-hidden="true" />
        <div className="hero-bg-overlay-2" aria-hidden="true" />
        <div className="hero-content">
          <HeroAvatar initials={getInitials(profile)} size={84} />
          <div className="hero-info">
            <div className="hero-title-group">
              <h1 className="hero-name">{fullName}</h1>
              <Pill label={ROLE_LABELS[profile.role] || profile.role} />
            </div>
            <div className="hero-email">
              {Icons.mail}
              {profile.email}
            </div>
            <div className="hero-joined">
              {Icons.calendar}
              Joined {formatJoined(profile)}
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="edit-profile-btn">
              {Icons.edit}
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* ═══ Success Toast ═══ */}
      {saveSuccess && (
        <SuccessBanner
          text="Profile updated successfully."
          onDismiss={() => setSaveSuccess(false)}
        />
      )}

      {/* ═══ Stats Grid ═══ */}
      <div className="stats-grid" role="region" aria-label="Profile statistics">
        <AnimatedStat
          icon={Icons.star}
          label="Points"
          value={profile.points_total ?? 0}
          color={C.primary}
        />
        <AnimatedStat
          icon={Icons.flame}
          label="Day streak"
          value={profile.streak_count ?? 0}
          color={C.warning}
        />
        <AnimatedStat
          icon={Icons.trophy}
          label="Rank"
          value={profile.rank_position ? `#${profile.rank_position}` : "—"}
          color={C.accent}
          isRank
        />
      </div>

      {/* ═══ Main Grid ═══ */}
      <div className="main-grid">
        {/* ─── Left Column ─── */}
        <div className="grid-column">
          {/* About Card */}
          <Card
            title="About"
            subtitle={editing ? "Update your public profile information" : undefined}
          >
            {editing ? (
              <div className="edit-form-group">
                <div className="edit-form-row">
                  <Field label="First name">
                    <input
                      className="form-input"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, first_name: e.target.value }))
                      }
                      placeholder="e.g. Ian"
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      className="form-input"
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, last_name: e.target.value }))
                      }
                      placeholder="e.g. Mwai"
                      autoComplete="family-name"
                    />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea
                    ref={bioRef}
                    rows={4}
                    className="form-input textarea"
                    placeholder="Tell the community a bit about yourself, your interests, and what you're studying…"
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    maxLength={500}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "var(--ec-muted)",
                      marginTop: 2,
                    }}
                  >
                    {form.bio.length}/500
                  </div>
                </Field>
              </div>
            ) : (
              <p className={`bio-text ${!profile.bio ? "empty" : ""}`}>
                {profile.bio || "No bio yet. Click Edit profile to add one."}
              </p>
            )}
          </Card>

          {/* Subjects Card */}
          <Card
            title="Subjects"
            subtitle="Topics you're learning or can help others with"
          >
            <div className="subjects-container">
              {editing ? (
                subjectOptions.length > 0 ? (
                  subjectOptions.map((tag) => (
                    <SubjectToggle
                      key={tag.id}
                      label={tag.name}
                      active={form.subjects.includes(tag.id)}
                      onClick={() => toggleSubject(tag.id)}
                    />
                  ))
                ) : (
                  <span className="empty-subjects">
                    No subjects available.
                  </span>
                )
              ): profile.subjects && profile.subjects.length > 0 ? (
                profile.subjects.map((s) => <Badge key={s.id} label={s.name} />)
              ) : (
                <span className="empty-subjects">No subjects added yet.</span>
              )}
            </div>
          </Card>

          {/* Edit Actions */}
          {editing && (
            <div className="action-group">
              <div className="button-row">
                <PrimaryButton onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      {Icons.check}
                      Save changes
                    </>
                  )}
                </PrimaryButton>
                <SecondaryButton onClick={cancelEdit} disabled={saving}>
                  Cancel
                </SecondaryButton>
              </div>
              <ErrorText text={saveError} />
            </div>
          )}
        </div>

        {/* ─── Right Column ─── */}
        <div className="grid-column right">
          {/* Account Card */}
          <Card title="Account">
            <InfoRow
              label="Email"
              value={profile.email}
              icon={Icons.mail}
            />
            <InfoRow
              label="Role"
              value={ROLE_LABELS[profile.role] || profile.role}
              icon={Icons.user}
            />
            <InfoRow
              label="Member since"
              value={formatJoined(profile)}
              icon={Icons.calendar}
              last
            />
          </Card>

          {/* Password Card */}
          <Card
            title="Password"
            subtitle="Keep your account secure"
          >
            {!pwOpen ? (
              <SecondaryButton onClick={() => setPwOpen(true)}>
                {Icons.shield}
                Change password
              </SecondaryButton>
            ) : (
              <form onSubmit={handlePasswordChange} className="password-form">
                <Field label="Current password">
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={pwForm.old_password}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        old_password: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </Field>
                <Field label="New password">
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-input"
                    value={pwForm.new_password}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        new_password: e.target.value,
                      }))
                    }
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <PasswordStrength password={pwForm.new_password} />
                </Field>
                <Field label="Confirm new password">
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={pwForm.confirm_password}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        confirm_password: e.target.value,
                      }))
                    }
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </Field>
                <ErrorText text={pwError} />
                {pwSuccess && (
                  <div className="password-success-msg">
                    {Icons.checkCircle}
                    Password updated successfully.
                  </div>
                )}
                <div className="button-row">
                  <PrimaryButton type="submit" disabled={pwSaving}>
                    {pwSaving ? (
                      <>
                        <span
                          style={{
                            display: "inline-block",
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Updating…
                      </>
                    ) : (
                      <>
                        {Icons.key}
                        Update password
                      </>
                    )}
                  </PrimaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={closePasswordForm}
                    disabled={pwSaving}
                  >
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