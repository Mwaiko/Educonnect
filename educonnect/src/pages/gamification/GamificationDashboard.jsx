import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

// ─── API helpers ──────────────────────────────────────────────────────────────
const BASE = "/gamification";

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    mode: "light",
    primary: "#4F46E5", primaryLight: "#EEF2FF", primaryMid: "#818CF8", primaryDark: "#312E81",
    accent: "#06B6D4", accentLight: "#ECFEFF",
    success: "#10B981", successLight: "#ECFDF5",
    warning: "#F59E0B", warningLight: "#FFFBEB",
    danger: "#EF4444", dangerLight: "#FEF2F2",
    surface: "#F8FAFC", surfaceElevated: "#FFFFFF",
    border: "rgba(79,70,229,0.15)",
    text: "#1E1B4B", textSecondary: "#6B7280", white: "#FFFFFF",
    bg: "#F0F2FA",
    sidebarBg: "linear-gradient(180deg, #312E81 0%, #1e1b4b 100%)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.04)",
    hoverShadow: "0 12px 24px rgba(79,70,229,0.15), 0 4px 8px rgba(0,0,0,0.04)",
    modalOverlay: "rgba(0,0,0,0.5)",
    inputBg: "#FFFFFF",
    scrollbarThumb: "rgba(79,70,229,0.2)",
    scrollbarThumbHover: "rgba(79,70,229,0.3)",
    gradientHero: "linear-gradient(135deg, #312E81 0%, #1e1b4b 100%)",
  },
  dark: {
    mode: "dark",
    primary: "#818CF8", primaryLight: "rgba(129,140,248,0.15)", primaryMid: "#A5B4FC", primaryDark: "#C7D2FE",
    accent: "#22D3EE", accentLight: "rgba(34,211,238,0.15)",
    success: "#34D399", successLight: "rgba(52,211,153,0.15)",
    warning: "#FBBF24", warningLight: "rgba(251,191,36,0.15)",
    danger: "#F87171", dangerLight: "rgba(248,113,113,0.15)",
    surface: "#1E1B4B", surfaceElevated: "#2D2A5E",
    border: "rgba(129,140,248,0.2)",
    text: "#F1F5F9", textSecondary: "#94A3B8", white: "#0F172A",
    bg: "#0B0F2A",
    sidebarBg: "linear-gradient(180deg, #0F0A3C 0%, #1a1647 100%)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.3)",
    hoverShadow: "0 12px 24px rgba(129,140,248,0.15), 0 4px 8px rgba(0,0,0,0.2)",
    modalOverlay: "rgba(0,0,0,0.7)",
    inputBg: "#1E1B4B",
    scrollbarThumb: "rgba(129,140,248,0.3)",
    scrollbarThumbHover: "rgba(129,140,248,0.5)",
    gradientHero: "linear-gradient(135deg, #1a1647 0%, #0F0A3C 100%)",
  }
};

function useTheme(controlledMode, controlledToggle) {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("educonnect-theme") || "light";
    }
    return "light";
  });

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("educonnect-theme", next);
      return next;
    });
  }, []);

  // If a parent passes themeMode/onToggleTheme (e.g. the dashboard's
  // global selector), defer to those instead of this component's own
  // local state, so the two stay in sync. Falls back to local state
  // for standalone use.
  const resolvedMode = controlledMode ?? mode;
  const resolvedToggle = controlledToggle ?? toggle;

  const t = THEMES[resolvedMode];
  return { mode: resolvedMode, toggle: resolvedToggle, t };
}

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ThemeToggle({ mode, onToggle, t }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {mode === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}

function FlameIcon({ active, size = 20, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transition: "all 0.4s ease" }}>
      <path
        d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z"
        fill={active ? t.warning : t.mode === "dark" ? "#334155" : "#E2E8F0"}
        opacity={active ? 1 : 0.35}
        style={{ transition: "all 0.4s ease" }}
      />
      <path
        d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-2 2-4 2-4s2 2 2 4z"
        fill={active ? "#FBBF24" : t.mode === "dark" ? "#475569" : "#F1F5F9"}
        style={{ transition: "all 0.4s ease" }}
      />
    </svg>
  );
}

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.09 8.26L19 7L14.74 11.09L21 12L14.74 12.91L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.91L3 12L9.26 11.09L5 7L10.91 8.26L12 2Z" fill="#F59E0B" opacity="0.8"/>
    </svg>
  );
}

function StreakCalendar({ history, t }) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const activeSet = new Set(
    history.filter((r) => r.events_count > 0).map((r) => r.date)
  );

  const [hoveredDay, setHoveredDay] = useState(null);

  return (
    <div className="streak-calendar">
      {days.map((day, i) => {
        const active = activeSet.has(day);
        const isToday = day === new Date().toISOString().split("T")[0];
        const label = new Date(day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={day}
            className={`cal-cell ${active ? "active" : ""} ${isToday ? "today" : ""}`}
            title={`${label}${active ? " ✓ Active" : ""}${isToday ? " (Today)" : ""}`}
            style={{ animationDelay: `${i * 15}ms` }}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {hoveredDay === day && (
              <div className="cal-tooltip">{label}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent, sub, icon, delay = 0, t }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`stat-card ${isVisible ? "visible" : ""}`}>
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <span className="stat-value" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function TransactionList({ transactions, t }) {
  const icons = {
    post_question: "❓",
    submit_answer: "💬",
    answer_endorsed: "⭐",
    answer_accepted: "✅",
    submit_resource: "📚",
    resource_milestone: "🏆",
    attend_session: "🎓",
  };

  if (!transactions.length)
    return (
      <div className="empty-state-card">
        <div className="empty-icon">🎯</div>
        <p className="empty-title">No activity yet</p>
        <p className="empty-desc">Start earning points by answering questions and joining sessions!</p>
      </div>
    );

  return (
    <ul className="tx-list">
      {transactions.map((tx, i) => (
        <li
          key={tx.id}
          className="tx-item"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="tx-icon-wrap">
            <span className="tx-icon">{icons[tx.event_type] ?? "🔹"}</span>
          </div>
          <div className="tx-content">
            <span className="tx-desc">{tx.event_type_display}</span>
            <span className="tx-date">
              {new Date(tx.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <span className="tx-points">+{tx.points_awarded}</span>
        </li>
      ))}
    </ul>
  );
}

function Leaderboard({ timeframe, onChangeTimeframe, t }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    setLoading(true);
    api.get(`${BASE}/leaderboard/?timeframe=${timeframe}`)
      .then((res) => {
        setEntries(res.data.leaderboard ?? res.data);
        setTimeout(() => setAnimating(false), 50);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeframe]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="leaderboard">
      <div className="lb-header">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <div className="timeframe-tabs">
          {["weekly", "monthly", "all"].map((tf) => (
            <button
              key={tf}
              className={`tab-btn ${timeframe === tf ? "active" : ""}`}
              onClick={() => onChangeTimeframe(tf)}
            >
              {tf === "all" ? "All Time" : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state-card compact">
          <div className="empty-icon small">📊</div>
          <p className="empty-title">No data yet</p>
          <p className="empty-desc">Be the first to make the leaderboard!</p>
        </div>
      ) : (
        <ol className={`lb-list ${animating ? "animating" : ""}`}>
          {entries.map((entry, i) => (
            <li
              key={entry.user_id}
              className={`lb-row ${i < 3 ? "podium" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="lb-rank">{medals[i] ?? i + 1}</span>
              <div className="lb-avatar">
                {entry.full_name
                  ? entry.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : entry.username?.slice(0, 2).toUpperCase() ?? "??"}
              </div>
              <span className="lb-name">
                {entry.full_name || entry.username}
              </span>
              <span className="lb-pts">{entry.total_points.toLocaleString()} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function StreakBadge({ streak, t }) {
  if (streak === 0) return null;
  return (
    <div className="streak-pill" style={{ animation: "pulse-badge 2s ease-in-out infinite" }}>
      <FlameIcon active t={t} size={16} />
      <span>{streak}-day streak</span>
    </div>
  );
}

function ProgressRing({ value, max = 100, size = 70, stroke = 5, color }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, max) / max) * circumference;
  const pct = Math.round((value / max) * 100);

  return (
    <div className="progress-ring-wrap">
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-value">{pct}%</span>
        <span className="progress-ring-label">to next</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function GamificationDashboard({ themeMode, onToggleTheme } = {}) {
  const { mode, toggle, t } = useTheme(themeMode, onToggleTheme);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("weekly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get(`${BASE}/me/`)
      .then((res) => setSummary(res.data))
      .catch((e) => setError(e.response?.status === 404
        ? "This feature isn't available yet."
        : e.message))
      .finally(() => setLoading(false));
  }, []);

  const animatedTotal = useAnimatedCounter(summary?.total_points ?? 0);
  const animatedStreak = useAnimatedCounter(summary?.current_streak ?? 0);

  if (loading)
    return (
      <div className="gd-loading" data-theme={mode}>
        <div className="spinner" />
        <p>Loading your stats…</p>
      </div>
    );

  if (error)
    return (
      <div className="gd-error" data-theme={mode}>
        <div className="gd-error-icon">⚠️</div>
        <p>Could not load gamification data.</p>
        <small>{error}</small>
        <button className="btn-retry" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );

  const streak = summary.current_streak ?? 0;
  const totalPoints = summary.total_points ?? 0;
  const streakHistory = summary.streak_history ?? [];
  const recentTransactions = summary.recent_transactions ?? [];
  const nextMilestone = Math.ceil((totalPoints + 1) / 100) * 100;
  const progressToNext = totalPoints % 100;

  const streakLabel =
    streak === 0
      ? "Start your streak today!"
      : streak === 1
      ? "1 day — keep it going!"
      : `${streak} days strong 🔥`;

  return (
    <>
      <style>{getStyles(t, mode)}</style>
      <div className={`gd-root ${mounted ? "mounted" : ""}`} data-theme={mode}>
        {/* ── Header ── */}
        <header className="gd-header">
          <div className="header-inner">
            <div className="header-brand">
              <div className="brand-logo">
                <div className="brand-logo-inner">
                  <div className="brand-logo-dot" />
                </div>
              </div>
              <div className="header-text">
                <h1 className="header-title">Your Progress</h1>
                <p className="header-streak">{streakLabel}</p>
              </div>
            </div>
            <div className="header-actions">
              <div className="header-flames">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flame-slot ${i < Math.min(streak, 5) ? "lit" : ""}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <FlameIcon active={i < Math.min(streak, 5)} t={t} size={22} />
                  </div>
                ))}
              </div>
              <ThemeToggle mode={mode} onToggle={toggle} t={t} />
            </div>
          </div>
        </header>

        {/* ── Stats row ── */}
        <section className="stats-row">
          <StatCard
            label="Total Points"
            value={animatedTotal.toLocaleString()}
            accent={t.primary}
            sub={`Next milestone: ${nextMilestone.toLocaleString()}`}
            icon={<SparkleIcon size={16} />}
            delay={100}
            t={t}
          />
          <StatCard
            label="Current Streak"
            value={`${animatedStreak} day${animatedStreak !== 1 ? "s" : ""}`}
            accent={t.warning}
            sub={streak > 0 ? "Keep the fire burning!" : "Log in daily to start"}
            icon={<FlameIcon active={streak > 0} t={t} size={16} />}
            delay={200}
            t={t}
          />
          <StatCard
            label="Events Today"
            value={streakHistory[0]?.events_count ?? 0}
            accent={t.success}
            sub="activity today"
            delay={300}
            t={t}
          />
          <div className="stat-card progress-card" style={{ animationDelay: "400ms" }}>
            <ProgressRing
              value={progressToNext}
              max={100}
              size={68}
              stroke={5}
              color={t.primary}
            />
          </div>
        </section>

        {/* ── Streak calendar ── */}
        <section className="card calendar-card">
          <div className="card-header">
            <div>
              <h2 className="section-title">30-Day Activity</h2>
              <p className="section-sub">Each square = one day. Orange = active.</p>
            </div>
            <StreakBadge streak={streak} t={t} />
          </div>
          <StreakCalendar history={streakHistory} t={t} />
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot" />
              <span>Active</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot today" />
              <span>Today</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot inactive" />
              <span>Inactive</span>
            </div>
          </div>
        </section>

        {/* ── Bottom split ── */}
        <div className="bottom-grid">
          {/* Recent activity */}
          <section className="card">
            <div className="card-header">
              <h2 className="section-title">Recent Activity</h2>
              <span className="badge badge-indigo">
                {recentTransactions.length} events
              </span>
            </div>
            <TransactionList transactions={recentTransactions} t={t} />
          </section>

          {/* Leaderboard */}
          <section className="card">
            <Leaderboard
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              t={t}
            />
          </section>
        </div>
      </div>
    </>
  );
}

// ─── Dynamic Styles ───────────────────────────────────────────────────────────

function getStyles(t, mode) {
  const isDark = mode === "dark";
  return `
    /* ─── Base ─── */
    .gd-root[data-theme="${mode}"] {
      min-height: 100vh;
      background: ${t.bg};
      color: ${t.text};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 0 0 3rem;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.5s ease, transform 0.5s ease, background 0.3s ease, color 0.3s ease;
    }
    .gd-root[data-theme="${mode}"].mounted {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Theme Toggle ─── */
    .theme-toggle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid ${t.border};
      background: ${t.surfaceElevated};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .theme-toggle:hover {
      transform: scale(1.08);
      box-shadow: ${t.cardShadow};
    }

    /* ─── Header ─── */
    .gd-header {
      background: ${t.gradientHero};
      padding: 2rem 2rem 1.75rem;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }
    .gd-header::before {
      content: "";
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,${isDark ? "0.04" : "0.08"}) 0%, transparent 70%);
      pointer-events: none;
    }
    .header-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .brand-logo {
      width: 44px;
      height: 44px;
      background: ${t.white};
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,${isDark ? "0.3" : "0.15"});
      transition: background 0.3s ease;
    }
    .brand-logo-inner {
      width: 26px;
      height: 26px;
      background: ${isDark ? "#818CF8" : "#4F46E5"};
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }
    .brand-logo-dot {
      width: 8px;
      height: 8px;
      background: ${t.white};
      border-radius: 50%;
      transition: background 0.3s ease;
    }
    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: ${isDark ? "#F1F5F9" : "#FFFFFF"};
      transition: color 0.3s ease;
    }
    .header-streak {
      margin-top: 0.2rem;
      color: ${isDark ? "rgba(241,245,249,0.6)" : "rgba(255,255,255,0.75)"};
      font-size: 0.85rem;
      font-weight: 400;
      transition: color 0.3s ease;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .header-flames {
      display: flex;
      gap: 4px;
      background: rgba(255,255,255,${isDark ? "0.06" : "0.12"});
      padding: 6px 10px;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      transition: background 0.3s ease;
    }
    .flame-slot {
      opacity: 0;
      transform: scale(0.5);
      animation: flame-pop 0.4s ease forwards;
    }
    .flame-slot.lit {
      animation: flame-pop 0.4s ease forwards, flame-flicker 2s ease-in-out infinite;
      animation-delay: var(--delay, 0s), 0.5s;
    }

    /* ─── Stats Row ─── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      max-width: 960px;
      margin: -1.5rem auto 0;
      padding: 0 1.5rem;
      position: relative;
      z-index: 2;
    }
    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .stats-row { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      box-shadow: ${t.cardShadow};
      opacity: 0;
      transform: translateY(16px);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: ${t.hoverShadow};
    }
    .stat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stat-label {
      font-size: 0.7rem;
      color: ${t.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: ${t.primaryLight};
      border-radius: 8px;
      transition: background 0.3s ease;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .stat-sub {
      font-size: 0.75rem;
      color: ${t.textSecondary};
      font-weight: 400;
    }

    .progress-card {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
    }
    .progress-ring-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .progress-ring {
      transform: rotate(-90deg);
    }
    .progress-ring-bg {
      fill: none;
      stroke: ${isDark ? "#2D2A5E" : "#E2E8F0"};
      transition: stroke 0.3s ease;
    }
    .progress-ring-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .progress-ring-text {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .progress-ring-value {
      font-size: 1rem;
      font-weight: 700;
      color: ${t.primary};
      transition: color 0.3s ease;
    }
    .progress-ring-label {
      font-size: 0.6rem;
      color: ${t.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: color 0.3s ease;
    }

    /* ─── Cards ─── */
    .card {
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: ${t.cardShadow};
      transition: box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease;
    }
    .card:hover {
      box-shadow: ${t.hoverShadow};
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: ${t.text};
      letter-spacing: -0.01em;
      transition: color 0.3s ease;
    }
    .section-sub {
      font-size: 0.78rem;
      color: ${t.textSecondary};
      margin-top: 0.15rem;
      transition: color 0.3s ease;
    }

    /* ─── Wrapping containers ─── */
    .gd-root > .card,
    .bottom-grid,
    .stats-row {
      max-width: 960px;
      margin-left: auto;
      margin-right: auto;
    }
    .gd-root > .card {
      margin-top: 1.5rem;
      margin-left: 1.5rem;
      margin-right: 1.5rem;
    }
    @media (min-width: 640px) {
      .gd-root > .card {
        margin-left: auto;
        margin-right: auto;
      }
    }

    /* ─── Streak Calendar ─── */
    .calendar-card .card-header {
      margin-bottom: 1.25rem;
    }
    .streak-calendar {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      gap: 5px;
      margin-top: 0.5rem;
    }
    @media (max-width: 600px) {
      .streak-calendar { grid-template-columns: repeat(10, 1fr); }
    }
    .cal-cell {
      aspect-ratio: 1;
      border-radius: 6px;
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
      border: 1px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
      opacity: 0;
      transform: scale(0.8);
      animation: cell-pop 0.3s ease forwards;
    }
    .cal-cell:hover {
      transform: scale(1.15);
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? "0.3" : "0.1"});
    }
    .cal-cell.active {
      background: linear-gradient(135deg, ${t.warning}, ${isDark ? "#F97316" : "#EA580C"});
      border-color: ${isDark ? "#F97316" : "#EA580C"};
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.3);
    }
    .cal-cell.active:hover {
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.5);
    }
    .cal-cell.today {
      border: 2px solid ${t.primary};
      box-shadow: 0 0 0 2px ${isDark ? "rgba(129,140,248,0.2)" : "rgba(79,70,229,0.15)"};
    }
    .cal-cell.today.active {
      border-color: ${t.primary};
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.3), 0 0 0 2px ${isDark ? "rgba(129,140,248,0.2)" : "rgba(79,70,229,0.15)"};
    }
    .cal-tooltip {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: ${isDark ? "#0F0A3C" : "#1E1B4B"};
      color: white;
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 10;
      animation: tooltip-fade 0.15s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .cal-tooltip::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: ${isDark ? "#0F0A3C" : "#1E1B4B"};
    }

    .calendar-legend {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 0.5px solid ${t.border};
      transition: border-color 0.3s ease;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: ${t.textSecondary};
      transition: color 0.3s ease;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      background: linear-gradient(135deg, ${t.warning}, ${isDark ? "#F97316" : "#EA580C"});
    }
    .legend-dot.today {
      background: ${t.surfaceElevated};
      border: 2px solid ${t.primary};
    }
    .legend-dot.inactive {
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
    }

    /* ─── Streak Pill ─── */
    .streak-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(90deg, ${isDark ? "#818CF8" : "#4F46E5"}, #7C3AED);
      color: white;
      border-radius: 99px;
      padding: 5px 14px;
      font-size: 0.8rem;
      font-weight: 500;
      box-shadow: 0 2px 8px ${isDark ? "rgba(129,140,248,0.3)" : "rgba(79,70,229,0.3)"};
    }

    /* ─── Bottom Grid ─── */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 0 1.5rem;
    }
    @media (max-width: 768px) {
      .bottom-grid { grid-template-columns: 1fr; }
    }

    /* ─── Transaction List ─── */
    .tx-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
      max-height: 320px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .tx-list::-webkit-scrollbar { width: 4px; }
    .tx-list::-webkit-scrollbar-track { background: transparent; }
    .tx-list::-webkit-scrollbar-thumb { background: ${t.scrollbarThumb}; border-radius: 4px; }
    .tx-list::-webkit-scrollbar-thumb:hover { background: ${t.scrollbarThumbHover}; }

    .tx-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      background: ${t.surface};
      border-radius: 10px;
      border: 0.5px solid ${t.border};
      font-size: 0.82rem;
      opacity: 0;
      transform: translateX(-8px);
      animation: slide-in 0.35s ease forwards;
      transition: all 0.15s ease;
      cursor: default;
    }
    .tx-item:hover {
      background: ${t.primaryLight};
      border-color: ${isDark ? "rgba(129,140,248,0.25)" : "rgba(79,70,229,0.15)"};
      transform: translateX(2px);
    }
    .tx-icon-wrap {
      width: 32px;
      height: 32px;
      background: ${t.surfaceElevated};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: ${t.cardShadow};
      transition: background 0.3s ease;
    }
    .tx-icon { font-size: 0.95rem; }
    .tx-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .tx-desc { color: ${t.text}; font-weight: 500; font-size: 0.8rem; transition: color 0.3s ease; }
    .tx-date { color: ${t.textSecondary}; font-size: 0.7rem; transition: color 0.3s ease; }
    .tx-points {
      color: ${t.primary};
      font-weight: 700;
      font-size: 0.85rem;
      white-space: nowrap;
      background: ${t.primaryLight};
      padding: 3px 8px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    /* ─── Leaderboard ─── */
    .lb-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .timeframe-tabs {
      display: flex;
      gap: 4px;
      background: ${t.surface};
      padding: 3px;
      border-radius: 8px;
      transition: background 0.3s ease;
    }
    .tab-btn {
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: ${t.textSecondary};
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .tab-btn:hover {
      color: ${t.primary};
    }
    .tab-btn.active {
      background: ${t.surfaceElevated};
      color: ${t.primary};
      box-shadow: ${t.cardShadow};
    }

    .lb-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-height: 320px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .lb-list::-webkit-scrollbar { width: 4px; }
    .lb-list::-webkit-scrollbar-track { background: transparent; }
    .lb-list::-webkit-scrollbar-thumb { background: ${t.scrollbarThumb}; border-radius: 4px; }
    .lb-list::-webkit-scrollbar-thumb:hover { background: ${t.scrollbarThumbHover}; }

    .lb-row {
      display: grid;
      grid-template-columns: 2rem 2.25rem 1fr auto;
      align-items: center;
      gap: 0.6rem;
      padding: 0.55rem 0.75rem;
      background: ${t.surface};
      border-radius: 10px;
      border: 0.5px solid ${t.border};
      font-size: 0.82rem;
      opacity: 0;
      transform: translateY(6px);
      animation: slide-up 0.35s ease forwards;
      transition: all 0.15s ease;
    }
    .lb-row:hover {
      background: ${t.primaryLight};
      border-color: ${isDark ? "rgba(129,140,248,0.2)" : "rgba(79,70,229,0.12)"};
      transform: translateX(2px);
    }
    .lb-row.podium {
      background: ${isDark
        ? "linear-gradient(90deg, rgba(129,140,248,0.1), rgba(124,58,237,0.06))"
        : "linear-gradient(90deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))"};
      border-color: ${isDark ? "rgba(129,140,248,0.2)" : "rgba(79,70,229,0.12)"};
    }
    .lb-row.podium:hover {
      background: ${isDark
        ? "linear-gradient(90deg, rgba(129,140,248,0.15), rgba(124,58,237,0.1))"
        : "linear-gradient(90deg, rgba(79,70,229,0.1), rgba(124,58,237,0.08))"};
    }
    .lb-rank {
      font-size: 1rem;
      text-align: center;
      width: 2rem;
    }
    .lb-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${isDark ? "#818CF8" : "#4F46E5"}, #7C3AED);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .lb-name {
      color: ${t.text};
      font-weight: 500;
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.3s ease;
    }
    .lb-pts {
      color: ${t.primary};
      font-weight: 700;
      font-size: 0.78rem;
      white-space: nowrap;
      transition: color 0.3s ease;
    }

    /* ─── Badges ─── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.7rem;
      font-weight: 500;
    }
    .badge-indigo {
      background: ${t.primaryLight};
      color: ${t.primary};
      transition: all 0.3s ease;
    }

    /* ─── Empty States ─── */
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 1rem;
      gap: 0.5rem;
    }
    .empty-state-card.compact {
      padding: 1.25rem 1rem;
    }
    .empty-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }
    .empty-icon.small { font-size: 1.5rem; }
    .empty-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: ${t.text};
      transition: color 0.3s ease;
    }
    .empty-desc {
      font-size: 0.75rem;
      color: ${t.textSecondary};
      max-width: 240px;
      line-height: 1.5;
      transition: color 0.3s ease;
    }

    /* ─── Loading Skeleton ─── */
    .loading-skeleton {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .skeleton-row {
      height: 44px;
      background: linear-gradient(90deg, ${isDark ? "#2D2A5E" : "#F1F5F9"} 25%, ${isDark ? "#3D3A6E" : "#E2E8F0"} 50%, ${isDark ? "#2D2A5E" : "#F1F5F9"} 75%);
      background-size: 200% 100%;
      border-radius: 10px;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    /* ─── Loading & Error States ─── */
    .gd-loading[data-theme="${mode}"] {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: 1rem;
      color: ${t.textSecondary};
      font-family: 'Inter', system-ui, sans-serif;
      background: ${t.bg};
      transition: background 0.3s ease, color 0.3s ease;
    }
    .gd-loading .spinner {
      width: 36px; height: 36px;
      border: 3px solid ${isDark ? "#2D2A5E" : "#E2E8F0"};
      border-top-color: ${t.primary};
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      transition: border-color 0.3s ease;
    }
    .gd-error[data-theme="${mode}"] {
      max-width: 400px;
      margin: 4rem auto;
      text-align: center;
      color: ${t.danger};
      padding: 2.5rem 2rem;
      background: ${t.surfaceElevated};
      border-radius: 16px;
      border: 0.5px solid ${t.dangerLight};
      box-shadow: ${t.cardShadow};
      font-family: 'Inter', system-ui, sans-serif;
      transition: all 0.3s ease;
    }
    .gd-error-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .gd-error p {
      font-size: 1rem;
      font-weight: 600;
      color: ${t.text};
      margin-bottom: 0.3rem;
      transition: color 0.3s ease;
    }
    .gd-error small {
      color: ${t.textSecondary};
      display: block;
      margin-bottom: 1.25rem;
      font-size: 0.8rem;
      transition: color 0.3s ease;
    }
    .btn-retry {
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      border: none;
      background: ${t.primary};
      color: ${isDark ? "#0F172A" : "#FFFFFF"};
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      transition: opacity 0.15s, background 0.3s ease, color 0.3s ease;
    }
    .btn-retry:hover { opacity: 0.88; }

    /* ─── Keyframes ─── */
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes flame-pop {
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes flame-flicker {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes cell-pop {
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slide-in {
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slide-up {
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes tooltip-fade {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes pulse-badge {
      0%, 100% { box-shadow: 0 2px 8px ${isDark ? "rgba(129,140,248,0.3)" : "rgba(79,70,229,0.3)"}; }
      50% { box-shadow: 0 2px 16px ${isDark ? "rgba(129,140,248,0.5)" : "rgba(79,70,229,0.5)"}; }
    }
  `;
}