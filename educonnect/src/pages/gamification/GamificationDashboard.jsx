import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import "./gamification.css";

// ─── API helpers ──────────────────────────────────────────────────────────────
const BASE = "/gamification";

// ─── Theme System ─────────────────────────────────────────────────────────────
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

  // Defer to controlled props if provided (for global sync), fallback to local
  const resolvedMode = controlledMode ?? mode;
  const resolvedToggle = controlledToggle ?? toggle;

  return { mode: resolvedMode, toggle: resolvedToggle };
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

function ThemeToggle({ mode, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {mode === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--textSecondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function FlameIcon({ active, size = 20 }) {
  return (
    <svg className="flame-icon" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z"
        fill={active ? "var(--warning)" : "var(--flame-inactive-1)"}
        opacity={active ? 1 : 0.35}
      />
      <path
        d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-2 2-4 2-4s2 2 2 4z"
        fill={active ? "#FBBF24" : "var(--flame-inactive-2)"}
      />
    </svg>
  );
}

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.09 8.26L19 7L14.74 11.09L21 12L14.74 12.91L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.91L3 12L9.26 11.09L5 7L10.91 8.26L12 2Z" fill="var(--warning)" opacity="0.8"/>
    </svg>
  );
}

function StreakCalendar({ history }) {
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

function StatCardShell({ delay = 0, className = "", children }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`gd-stat-card ${className} ${isVisible ? "visible" : ""}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent, sub, icon, delay = 0 }) {
  return (
    <StatCardShell delay={delay}>
      <div className="gd-stat-card-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <span className="stat-value" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </StatCardShell>
  );
}

function TransactionList({ transactions }) {
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

function Leaderboard({ timeframe, onChangeTimeframe }) {
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
              className={`gd-tab-btn ${timeframe === tf ? "active" : ""}`}
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

function StreakBadge({ streak }) {
  if (streak === 0) return null;
  return (
    <div className="streak-pill">
      <FlameIcon active size={16} />
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
  const { mode, toggle } = useTheme(themeMode, onToggleTheme);
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
                  <FlameIcon active={i < Math.min(streak, 5)} size={22} />
                </div>
              ))}
            </div>
            <ThemeToggle mode={mode} onToggle={toggle} />
          </div>
        </div>
      </header>

      {/* ── Stats row ── */}
      <div className="gd-container gd-stats-wrap">
        <section className="stats-row">
          <StatCard
            label="Total Points"
            value={animatedTotal.toLocaleString()}
            accent="var(--primary)"
            sub={`Next milestone: ${nextMilestone.toLocaleString()}`}
            icon={<SparkleIcon size={16} />}
            delay={100}
          />
          <StatCard
            label="Current Streak"
            value={`${animatedStreak} day${animatedStreak !== 1 ? "s" : ""}`}
            accent="var(--warning)"
            sub={streak > 0 ? "Keep the fire burning!" : "Log in daily to start"}
            icon={<FlameIcon active={streak > 0} size={16} />}
            delay={200}
          />
          <StatCard
            label="Events Today"
            value={streakHistory[0]?.events_count ?? 0}
            accent="var(--success)"
            sub="activity today"
            delay={300}
          />
          <StatCardShell className="progress-card" delay={400}>
            <ProgressRing
              value={progressToNext}
              max={100}
              size={68}
              stroke={5}
              color="var(--primary)"
            />
          </StatCardShell>
        </section>
      </div>

      {/* ── Streak calendar ── */}
      <div className="gd-container">
        <section className="card calendar-card section-calendar">
          <div className="card-header">
            <div>
              <h2 className="section-title">30-Day Activity</h2>
              <p className="section-sub">Each square = one day. Orange = active.</p>
            </div>
            <StreakBadge streak={streak} />
          </div>
          <StreakCalendar history={streakHistory} />
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot active" />
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
      </div>

      {/* ── Bottom split ── */}
      <div className="gd-container">
        <div className="bottom-grid section-bottom">
          {/* Recent activity */}
          <section className="card">
            <div className="card-header">
              <h2 className="section-title">Recent Activity</h2>
              <span className="gd-badge gd-badge-indigo">
                {recentTransactions.length} events
              </span>
            </div>
            <TransactionList transactions={recentTransactions} />
          </section>

          {/* Leaderboard */}
          <section className="card">
            <Leaderboard
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
            />
          </section>
        </div>
      </div>
    </div>
  );
}