import { useState, useEffect } from "react";

// ─── API helpers ──────────────────────────────────────────────────────────────
const BASE = "/api/gamification";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

async function fetchJSON(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FlameIcon({ active }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-5-5-11-5-11z"
        fill={active ? "#f97316" : "#cbd5e1"}
        opacity={active ? 1 : 0.5}
      />
      <path
        d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-2 2-4 2-4s2 2 2 4z"
        fill={active ? "#fbbf24" : "#e2e8f0"}
      />
    </svg>
  );
}

function StreakCalendar({ history }) {
  // Build a 30-day array
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const activeSet = new Set(
    history.filter((r) => r.events_count > 0).map((r) => r.date)
  );

  return (
    <div className="streak-calendar">
      {days.map((day) => {
        const active = activeSet.has(day);
        const label = new Date(day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={day}
            className={`cal-cell ${active ? "active" : ""}`}
            title={`${label}${active ? " ✓" : ""}`}
          />
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
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
    return <p className="empty-state">No activity yet — start earning points!</p>;

  return (
    <ul className="tx-list">
      {transactions.map((tx) => (
        <li key={tx.id} className="tx-item">
          <span className="tx-icon">{icons[tx.event_type] ?? "🔹"}</span>
          <span className="tx-desc">{tx.event_type_display}</span>
          <span className="tx-points">+{tx.points_awarded} pts</span>
          <span className="tx-date">
            {new Date(tx.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Leaderboard({ timeframe, onChangeTimeframe }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJSON(`${BASE}/leaderboard/?timeframe=${timeframe}`)
      .then((d) => setEntries(d.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeframe]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="leaderboard">
      <div className="lb-header">
        <h2 className="section-title">Leaderboard</h2>
        <div className="timeframe-tabs">
          {["weekly", "monthly", "all"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${timeframe === t ? "active" : ""}`}
              onClick={() => onChangeTimeframe(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="empty-state">No data for this period yet.</p>
      ) : (
        <ol className="lb-list">
          {entries.map((entry, i) => (
            <li key={entry.user_id} className={`lb-row ${i < 3 ? "podium" : ""}`}>
              <span className="lb-rank">{medals[i] ?? i + 1}</span>
              <span className="lb-name">
                {entry.full_name || entry.username}
              </span>
              <span className="lb-pts">{entry.total_points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function GamificationDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("weekly");

  useEffect(() => {
    fetchJSON(`${BASE}/me/`)
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="gd-loading">
        <div className="spinner" />
        <p>Loading your stats…</p>
      </div>
    );

  if (error)
    return (
      <div className="gd-error">
        <p>⚠️ Could not load gamification data.</p>
        <small>{error}</small>
      </div>
    );

  const streak = summary.current_streak;
  const streakLabel =
    streak === 0
      ? "No streak — log in daily to start one!"
      : streak === 1
      ? "1-day streak — keep going!"
      : `${streak}-day streak 🔥`;

  return (
    <>
      <style>{styles}</style>
      <div className="gd-root">
        {/* ── Header ── */}
        <header className="gd-header">
          <div className="header-inner">
            <div className="header-flame">
              {Array.from({ length: 5 }).map((_, i) => (
                <FlameIcon key={i} active={i < Math.min(streak, 5)} />
              ))}
            </div>
            <div>
              <h1 className="header-title">Your Progress</h1>
              <p className="header-streak">{streakLabel}</p>
            </div>
          </div>
        </header>

        {/* ── Stats row ── */}
        <section className="stats-row">
          <StatCard
            label="Total Points"
            value={summary.total_points.toLocaleString()}
            accent="#f97316"
          />
          <StatCard
            label="Current Streak"
            value={`${streak} day${streak !== 1 ? "s" : ""}`}
            accent="#6366f1"
          />
          <StatCard
            label="Events This Streak"
            value={
              summary.streak_history[0]?.events_count ?? 0
            }
            accent="#10b981"
            sub="today"
          />
        </section>

        {/* ── Streak calendar ── */}
        <section className="card">
          <h2 className="section-title">30-Day Activity</h2>
          <p className="section-sub">Each square = one day. Orange = active.</p>
          <StreakCalendar history={summary.streak_history} />
        </section>

        {/* ── Bottom split ── */}
        <div className="bottom-grid">
          {/* Recent activity */}
          <section className="card">
            <h2 className="section-title">Recent Activity</h2>
            <TransactionList transactions={summary.recent_transactions} />
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
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  /* Reset & base */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .gd-root {
    min-height: 100vh;
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    padding: 0 0 3rem;
  }

  /* Header */
  .gd-header {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%);
    border-bottom: 1px solid #1e293b;
    padding: 2rem 2rem 1.5rem;
  }
  .header-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .header-flame {
    display: flex;
    gap: 2px;
  }
  .header-title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #f1f5f9;
  }
  .header-streak {
    margin-top: 0.2rem;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  /* Stats row */
  .stats-row {
    display: flex;
    gap: 1rem;
    max-width: 900px;
    margin: 1.5rem auto 0;
    padding: 0 2rem;
    flex-wrap: wrap;
  }
  .stat-card {
    flex: 1 1 160px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .stat-sub {
    font-size: 0.75rem;
    color: #475569;
  }

  /* Cards */
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
  }
  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }
  .section-sub {
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 0.2rem;
    margin-bottom: 1rem;
  }

  /* Wrapping containers */
  .gd-root > .card,
  .bottom-grid,
  .stats-row {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  .gd-root > .card {
    margin-top: 1.5rem;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    border: 1px solid #334155;
    background: #1e293b;
    margin-left: 2rem;
    margin-right: 2rem;
  }
  @media (min-width: 640px) {
    .gd-root > .card {
      margin-left: auto;
      margin-right: auto;
      padding: 1.5rem 2rem;
    }
  }

  /* Streak calendar */
  .streak-calendar {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    gap: 4px;
    margin-top: 0.5rem;
  }
  @media (max-width: 500px) {
    .streak-calendar { grid-template-columns: repeat(10, 1fr); }
  }
  .cal-cell {
    aspect-ratio: 1;
    border-radius: 4px;
    background: #0f172a;
    border: 1px solid #1e293b;
    transition: background 0.15s;
  }
  .cal-cell.active {
    background: #f97316;
    border-color: #ea580c;
    box-shadow: 0 0 6px #f9731644;
  }

  /* Bottom grid */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
    padding: 0 2rem;
  }
  @media (max-width: 640px) {
    .bottom-grid { grid-template-columns: 1fr; }
  }

  /* Transaction list */
  .tx-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
  .tx-item {
    display: grid;
    grid-template-columns: 2rem 1fr auto auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
    font-size: 0.82rem;
  }
  .tx-icon { font-size: 1rem; text-align: center; }
  .tx-desc { color: #cbd5e1; }
  .tx-points { color: #f97316; font-weight: 700; white-space: nowrap; }
  .tx-date { color: #475569; font-size: 0.75rem; white-space: nowrap; }

  /* Leaderboard */
  .lb-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
  .timeframe-tabs { display: flex; gap: 4px; }
  .tab-btn {
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    border: 1px solid #334155;
    background: transparent;
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tab-btn.active, .tab-btn:hover {
    background: #6366f1;
    border-color: #6366f1;
    color: #fff;
  }
  .lb-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
  .lb-row {
    display: grid;
    grid-template-columns: 2rem 1fr auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
    font-size: 0.85rem;
  }
  .lb-row.podium { border-color: #334155; background: #12203a; }
  .lb-rank { font-size: 1.1rem; text-align: center; }
  .lb-name { color: #e2e8f0; font-weight: 500; }
  .lb-pts { color: #6366f1; font-weight: 700; white-space: nowrap; }

  /* Misc */
  .empty-state { color: #475569; font-size: 0.85rem; margin-top: 0.75rem; }
  .loading-text { color: #475569; font-size: 0.85rem; }
  .gd-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 60vh; gap: 1rem; color: #64748b;
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid #1e293b;
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .gd-error {
    max-width: 400px; margin: 4rem auto; text-align: center;
    color: #f87171; padding: 2rem;
    background: #1e293b; border-radius: 12px;
  }
  .gd-error small { color: #64748b; display: block; margin-top: 0.5rem; }
`;
