import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext"; // 1. Use the new global context hook
import QuestionFeed       from "./forum/QuestionFeed";
import AskQuestionForm    from "./forum/AskQuestionForm";
import QuestionDetailPage from "./forum/QuestionDetailPage";
import GamificationDashboard from "./gamification/GamificationDashboard";
import ResourceList       from "./Resources/ResourceList";
import ResourceForm       from "./Resources/ResourceForm";
import ProfilePage        from "./profile/ProfilePage";
import GroupList          from "./Groups/GroupList";
import GroupDetail        from "./Groups/GroupDetail";
import ChatRoom           from "./Chat/ChatRoom";
import "./dashboard.css";

const AUTHOR_COLORS = ["primary", "accent", "success", "warning", "danger"];
function hashAuthorColor(author) {
  const seed = String(author?.id ?? author?.username ?? "");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AUTHOR_COLORS[h % AUTHOR_COLORS.length];
}

// Tag names are now dynamic (real Tag rows from the shared taxonomy) rather
// than a fixed handful of hardcoded subjects, so colors are hashed from the
// tag's id instead of a static { "Algorithms": [...] } lookup table.
const TAG_COLOR_KEYS = ["primary", "accent", "success", "warning"];
function hashTagColor(tag, C) {
  const seed = String(tag?.id ?? tag?.slug ?? tag?.name ?? "");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const key = TAG_COLOR_KEYS[h % TAG_COLOR_KEYS.length];
  return [C[`${key}Light`], C[key]];
}

function normalizeQuestion(q) {
  return {
    ...q,
    upvotes:     q.upvote_count  ?? 0,
    answers:     q.answer_count  ?? 0,
    time:        q.created_at,
    status:      q.is_resolved ? "resolved" : "open",
    tags:        Array.isArray(q.tags) ? q.tags : [],
    authorColor: hashAuthorColor(q.author),
  };
}

function normalizeStudyGroup(g) {
  const memberships = Array.isArray(g.members) ? g.members : [];
  const meetingLinks = Array.isArray(g.meeting_links) ? g.meeting_links : [];
  const nextMeeting = meetingLinks[0];
  return {
    ...g,
    members: g.member_count ?? memberships.length,
    max: g.max_members ?? memberships.length,
    avatars: memberships.slice(0, 3).map(m => getInitials(m.user)),
    color: hashAuthorColor({ id: g.id, username: g.subject_tag }),
    meeting: nextMeeting?.scheduled_at
      ? new Date(nextMeeting.scheduled_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "No meeting scheduled",
    provider: nextMeeting?.provider ?? "—",
  };
}

const dashboardApi = {
  getUser:          () => api.get("/auth/me/").then(r => r.data),
  getStats:         () => api.get("/dashboard/stats/").then(r => r.data),
  getQuestions:     () => api.get("/forum/questions/?page_size=5&ordering=-created_at").then(r => (r.data.results ?? r.data).map(normalizeQuestion)),
  getStudyGroups:   () => api.get("/groups/?page_size=5").then(r => (r.data.results ?? r.data).map(normalizeStudyGroup)),
  getNotifications: () => api.get("/notifications/").then(r => r.data.results ?? r.data),
  getLeaderboard: () =>
  api.get("/gamification/leaderboard/?timeframe=weekly").then(r => {
    const list = r.data.leaderboard ?? r.data;
    return list.map((p, i) => ({
      rank: i + 1,
      name: p.full_name || p.username,
      points: p.total_points,
      streak: p.streak ?? 0,          // see note below — not in API yet
      initials: (p.full_name || p.username || "?")
        .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      color: "primary",               // or derive from user_id if you want variety
      isMe: false,
    }));
  }),
  getResources:     () => api.get("/resources/?page_size=5&ordering=-net_votes").then(r => r.data.results ?? r.data),
  getActivity:      () => api.get("/dashboard/activity/").then(r => r.data.results ?? r.data),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllNotificationsRead: () => api.post("/notifications/mark-all-read/"),
};

function getDisplayName(user, fallback = "there") {
  if (!user) return fallback;
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.username || fallback;
}
function getInitials(user) {
  if (!user) return "?";
  if (typeof user === "string") {
    return user.trim() ? user.trim()[0].toUpperCase() : "?";
  }
  if (user.initials) return user.initials;
  const f = user.first_name?.[0] ?? user.username?.[0] ?? "";
  const l = user.last_name?.[0] ?? "";
  const initials = (f + l).toUpperCase();
  return initials || "?";
}

// ═════════════════════════════════════════════════════════════════════════════
//  SHARED HOOKS
// ═════════════════════════════════════════════════════════════════════════════
function useAnimatedCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  useEffect(() => {
    startTimeRef.current = null;
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(eased * target);
      setCount(countRef.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { startTimeRef.current = null; };
  }, [target, duration]);
  return count;
}

function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const val = value instanceof Function ? value(stored) : value;
      setStored(val);
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { console.error(e); }
  };
  return [stored, setValue];
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// Removed duplicate useTheme hook

// ═════════════════════════════════════════════════════════════════════════════
//  SHARED SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
function Avatar({ initials, color, size = 36, overlap = false, ring = false }) {
  const { C } = useTheme();
  const resolvedColor = C[color] || color || C.primary;
  return (
    <div
      className={`avatar${overlap ? " overlap" : ""}${ring ? " ring" : ""}`}
      style={{
        "--size": `${size}px`,
        "--color": resolvedColor,
        "--overlap-border-color": C.themeMode === 'dark' ? C.surfaceElevated : "#fff",
      }}
    >{initials}</div>
  );
}

function Badge({ label, bg, color, icon }) {
  const { C } = useTheme();
  return (
    <span className="badge" style={{ "--badge-bg": bg || C.primaryLight, "--badge-color": color || C.primary }}>
      {icon && <span className="badge-icon">{icon}</span>}
      {label}
    </span>
  );
}

// Sub-components reading theme via useTheme hook directly
function LoadingSpinner() {
  const { C } = useTheme();
  return (
    <div className="loading-spinner-wrap">
      <div className="loading-spinner" style={{ "--border": C.border, "--primary": C.primary }} />
    </div>
  );
}

function SkeletonCard({ height = 80 }) {
  const { C } = useTheme();
  const [opacity, setOpacity] = useState(0.5);
  useEffect(() => {
    const interval = setInterval(() => setOpacity(prev => prev === 0.5 ? 0.8 : 0.5), 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className="skeleton-card"
      style={{ "--height": `${height}px`, "--opacity": opacity, "--surface": C.surface, "--border": C.border }}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  SIDEBAR
// ═════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { key: "dashboard",    icon: "🏠", label: "Dashboard" },
  { key: "forum",        icon: "💬", label: "Forum & Q&A" },
  { key: "groups",       icon: "👥", label: "Study Groups" },
  { key: "resources",    icon: "📚", label: "Resources" },
  { key: "gamification", icon: "🏆", label: "Progress" },
  { key: "profile",      icon: "👤", label: "My Profile" },
];

function Sidebar({ active, onNav, collapsed, onToggleCollapse, isLoggedIn, user, onLogout, isMobile, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const { C, themeMode, toggleTheme } = useTheme(); // Consumed context globally instead of via props

  const sidebarContent = (
    <>
      <div className="sidebar-header" style={{ "--justify": collapsed ? "center" : "flex-start" }}>
        {collapsed ? (
          <button onClick={onToggleCollapse} title="Expand sidebar" className="sidebar-icon-btn expand">→</button>
        ) : (
          <>
            <div className="sidebar-logo-box">
              <div className="sidebar-logo-inner" style={{ "--primary": C.primary, "--accent": C.accent }}>
                <div className="sidebar-logo-dot" />
              </div>
            </div>
            <div className="sidebar-brand">
              <div className="sidebar-brand-name">EduConnect</div>
              <div className="sidebar-brand-sub">Peer Learning</div>
            </div>
            {!isMobile && (
              <button onClick={onToggleCollapse} title="Collapse sidebar" className="sidebar-icon-btn collapse">←</button>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div className="theme-toggle-wrap">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            <span className="theme-toggle-icon">{themeMode === 'light' ? '🌙' : '☀️'}</span>
            <span>{themeMode === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          const isLocked = !isLoggedIn && item.key !== "dashboard" && item.key !== "forum";
          return (
            <button
              key={item.key}
              onClick={() => { if (!isLocked) { onNav(item.key); if (isMobile) onCloseMobile(); } }}
              className={`nav-item${isActive ? " active" : ""}${isLocked ? " locked" : ""}`}
              style={{
                "--padding": collapsed ? "12px" : "11px 16px",
                "--justify": collapsed ? "center" : "flex-start",
              }}
            >
              {isActive && (
                <div className="nav-item-indicator" style={{ "--accent": C.accent, "--primary": C.primary }} />
              )}
              <span className="nav-item-icon">{item.icon}</span>
              {!collapsed && (
                <span className="nav-item-label">
                  {item.label}
                  {isLocked && <span className="nav-item-lock">🔒</span>}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          {isLoggedIn ? (
            <div className="sidebar-account">
              <Avatar initials={getInitials(user)} color={C.accent} size={36} ring />
              <div className="sidebar-account-info">
                <div className="sidebar-account-name">{getDisplayName(user, "Account")}</div>
                <div className="sidebar-account-role">{user?.role || "Member"}</div>
              </div>
              <button onClick={onLogout} title="Sign out" className="sidebar-logout-btn">🚪</button>
            </div>
          ) : (
            <div className="sidebar-auth">
              <button onClick={() => navigate("/login")} className="sidebar-signin-btn">Sign in</button>
              <button
                onClick={() => navigate("/register")}
                className="sidebar-signup-btn"
                style={{ "--primary": C.primary }}
              >Create account</button>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="sidebar-mobile-overlay" style={{ "--modal-overlay": C.modalOverlay }} onClick={onCloseMobile} />
        )}
        <aside
          className="sidebar mobile"
          style={{ "--sidebar-bg": C.sidebarBg, "--mobile-x": mobileOpen ? "0" : "-100%" }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className="sidebar desktop"
      style={{ "--sidebar-bg": C.sidebarBg, "--width": collapsed ? "72px" : "240px" }}
    >
      {sidebarContent}
    </aside>
  );
}

function StatCard({ stat }) {
  const { C } = useTheme();
  const colorValue = C[stat.color] || stat.color;
  const animatedValue = useAnimatedCounter(stat.value);
  return (
    <div
      className="stat-card"
      style={{
        "--surface-elevated": C.surfaceElevated,
        "--border": C.border,
        "--accent-color": colorValue,
        "--card-shadow": C.cardShadow,
        "--hover-shadow": C.hoverShadow,
        "--text-secondary": C.textSecondary,
        "--delta-color": stat.delta.startsWith("+") ? C.success : C.textSecondary,
      }}
    >
      <div className="stat-card-bg" />
      <div className="stat-card-icon">{stat.icon}</div>
      <div className="stat-card-label">{stat.label}</div>
      <div className="stat-card-value">{animatedValue}</div>
      <div className="stat-card-delta">
        {stat.delta.startsWith("+") && <span className="stat-card-delta-arrow">↑</span>}
        {stat.delta}
      </div>
    </div>
  );
}

function QuestionCard({ q, blurred = false }) {
  const { C } = useTheme();
  const [upvoted, setUpvoted] = useState(false);
  const authorColor = C[q.authorColor] || q.authorColor;
  return (
    <div
      className={`question-card${blurred ? " blurred" : ""}`}
      style={{
        "--surface-elevated": C.surfaceElevated,
        "--border": C.border,
        "--primary": C.primary,
      }}
    >
      <div className="question-card-row">
        <div className="question-card-body">
          <div className="question-title" style={{ "--text": C.text }}>
            {q.title}
            {q.status === "resolved" && <Badge label="Resolved" bg={C.successLight} color={C.success} icon="✓" />}
          </div>
          <div className="question-desc" style={{ "--text-secondary": C.textSecondary }}>{q.body}</div>
          <div className="question-tags">
            {q.tags.map(tag => {
              const [bg, color] = hashTagColor(tag, C);
              return <Badge key={tag.id} label={tag.name} bg={bg} color={color} />;
            })}
            <span className="question-meta" style={{ "--text-secondary": C.textSecondary }}>
              <Avatar initials={getInitials(q.author)} color={authorColor} size={20} />
              <span>{q.time}</span>
              <span className="question-meta-divider" style={{ "--border": C.border }}>•</span>
              <span>{q.answers} answers</span>
            </span>
          </div>
        </div>
        {!blurred && (
          <button
            onClick={(e) => { e.stopPropagation(); setUpvoted(!upvoted); }}
            className="question-upvote-btn"
            style={{ "--upvote-bg": upvoted ? `${C.primary}11` : "transparent" }}
          >
            <div className="question-upvote-icon" style={{ "--upvote-color": upvoted ? C.primary : C.textSecondary, "--upvote-scale": upvoted ? 1.2 : 1 }}>⬆</div>
            <div className="question-upvote-count" style={{ "--upvote-color": upvoted ? C.primary : C.textSecondary }}>{q.upvotes + (upvoted ? 1 : 0)}</div>
          </button>
        )}
      </div>
    </div>
  );
}

function NotifItem({ n, onRead }) {
  const { C } = useTheme();
  const colorValue = C[n.color] || n.color;
  return (
    <div
      onClick={() => onRead && onRead(n.id)}
      className="notif-item"
      style={{
        "--accent-color": colorValue,
        "--notif-bg": n.read ? C.surface : `${colorValue}11`,
        "--notif-opacity": n.read ? 0.7 : 1,
      }}
    >
      {!n.read && <div className="notif-dot" />}
      <div className="notif-icon">{n.icon}</div>
      <div className="notif-body">
        <div className="notif-text" style={{ "--text": C.text, "--notif-weight": n.read ? 400 : 500 }}>{n.text}</div>
        <div className="notif-time-row" style={{ "--text-secondary": C.textSecondary }}>
          <span className="notif-time-icon">🕐</span>{n.time}
        </div>
      </div>
    </div>
  );
}

function StudyGroupCard({ group }) {
  const { C } = useTheme();
  const [joined, setJoined] = useState(false);
  const colorValue = C[group.color] || group.color;
  const avatars = Array.isArray(group.avatars) ? group.avatars : [];
  const members = group.members ?? 0;
  const max = group.max ?? 0;
  const progress = max ? (members / max) * 100 : 0;
  return (
    <div
      className="group-card"
      style={{
        "--surface-elevated": C.surfaceElevated,
        "--border": C.border,
        "--accent-color": colorValue,
        "--card-shadow": C.cardShadow,
        "--text": C.text,
        "--text-secondary": C.textSecondary,
      }}
    >
      <div className="group-card-topbar" style={{ "--accent-color": colorValue }} />
      <div className="group-card-header">
        <div>
          <div className="group-name">{group.name}</div>
          <div className="group-meeting">
            <span>📅</span>{group.meeting}
          </div>
        </div>
        <Badge label={group.provider} bg={`${colorValue}15`} color={colorValue} />
      </div>
      <div className="group-progress-row">
        <div className="group-progress-col">
          <div className="group-progress-label-row">
            <span className="group-progress-label">Members</span>
            <span className="group-progress-count" style={{ "--members-color": members === max ? C.danger : C.text }}>{members}/{max}</span>
          </div>
          <div className="group-progress-track" style={{ "--track-bg": C.themeMode === 'dark' ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
            <div className="group-progress-fill" style={{ "--accent-color": colorValue, "--progress": `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="group-footer">
        <div className="group-avatars">
          {avatars.map((av, i) => (
            <Avatar key={i} initials={av} color={i === 0 ? colorValue : i === 1 ? C.accent : C.success} size={28} overlap />
          ))}
          {members > avatars.length && (
            <Avatar initials={`+${members - avatars.length}`} color="#E2E8F0" size={28} overlap />
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
          className="group-join-btn"
          style={{ "--join-bg": joined ? C.successLight : colorValue, "--join-color": joined ? C.success : "#fff" }}
        >
          {joined ? "✓ Joined" : "Join"}
        </button>
      </div>
    </div>
  );
}

function LeaderboardRow({ p }) {
  const { C } = useTheme();
  const isTop3 = p.rank <= 3;
  const rankIcons = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colorValue = C[p.color] || p.color;
  return (
    <div
      className={`leaderboard-row${p.isMe ? " is-me" : ""}`}
      style={{
        "--row-bg": p.isMe ? `${C.accent}08` : "transparent",
        "--row-border": p.isMe ? `${C.accent}30` : "transparent",
        "--surface": C.surface,
      }}
    >
      <span className="leaderboard-rank" style={{ "--rank-color": isTop3 ? colorValue : C.textSecondary }}>
        {isTop3 ? rankIcons[p.rank] : `#${p.rank}`}
      </span>
      <Avatar initials={p.initials} color={colorValue} size={32} ring={p.isMe} />
      <div className="leaderboard-info">
        <div className="leaderboard-name" style={{ "--text": C.text, "--name-weight": p.isMe ? 600 : 500 }}>
          {p.name}
          {p.isMe && <Badge label="You" bg={C.accentLight} color={C.accent} />}
        </div>
        <div className="leaderboard-streak" style={{ "--text-secondary": C.textSecondary }}>
          <span>🔥</span>{p.streak}-day streak
        </div>
      </div>
      <div className="leaderboard-points" style={{ "--accent-color": colorValue }}>
        {p.points}<span className="leaderboard-points-unit" style={{ "--text-secondary": C.textSecondary }}>pts</span>
      </div>
    </div>
  );
}

const RESOURCE_TYPE_COLOR = {
  textbook: "primary",
  article: "accent",
  video: "warning",
  website: "success",
  other: "textSecondary",
};

function ResourceCard({ r }) {
  const { C } = useTheme();
  // Seed local vote state from what the API already told us about this user's vote.
  const [voted, setVoted] = useState(r.user_vote === 1);
  const colorValue = C[RESOURCE_TYPE_COLOR[r.resource_type]] || C.primary;
  const submitterName = r.submitted_by?.username || "Unknown";
  const baseVotes = r.net_votes ?? 0;
  const displayVotes = baseVotes + (voted ? 1 : 0) - (r.user_vote === 1 ? 1 : 0);
  return (
    <div
      className="resource-card"
      style={{
        "--surface-elevated": C.surfaceElevated,
        "--border": C.border,
        "--accent-color": colorValue,
      }}
    >
      <div className="resource-icon-box" style={{ "--accent-color": colorValue }}>
        {r.resource_type === "website" ? "🌐" : "📖"}
      </div>
      <div className="resource-body">
        <div className="resource-title" style={{ "--text": C.text }}>{r.title}</div>
        <div className="resource-meta" style={{ "--text-secondary": C.textSecondary }}>
          <Badge label={r.tag?.name || r.resource_type} bg={`${colorValue}15`} color={colorValue} />
          <span>by {submitterName}</span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setVoted(!voted); }}
        className="resource-vote-btn"
        style={{ "--vote-bg": voted ? `${C.primary}11` : "transparent" }}
      >
        <div className="resource-vote-icon" style={{ "--vote-color": voted ? C.primary : C.textSecondary, "--vote-scale": voted ? 1.15 : 1 }}>▲</div>
        <div className="resource-vote-count" style={{ "--vote-color": voted ? C.primary : C.textSecondary }}>{displayVotes}</div>
      </button>
    </div>
  );
}

function ActivityItem({ activity }) {
  const { C } = useTheme();
  const colorValue = C[activity.color] || activity.color;
  return (
    <div className="activity-item" style={{ "--border": C.border }}>
      <Avatar initials={activity.avatar} color={colorValue} size={30} />
      <div className="activity-body">
        <div className="activity-text" style={{ "--text": C.text }}>
          <strong>{activity.user}</strong>{" "}
          <span className="activity-action" style={{ "--text-secondary": C.textSecondary }}>{activity.action}</span>{" "}
          <span className="activity-target" style={{ "--primary": C.primary }}>{activity.target}</span>
        </div>
        <div className="activity-time" style={{ "--text-secondary": C.textSecondary }}>{activity.time}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  GUEST LANDING
// ═════════════════════════════════════════════════════════════════════════════
function GuestPromoPanel() {
  const { C } = useTheme();
  const navigate = useNavigate();
  const onLogin    = () => navigate("/login");
  const onRegister = () => navigate("/register");

  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [previewLeaderboard, setPreviewLeaderboard] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewErrors, setPreviewErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([dashboardApi.getQuestions(), dashboardApi.getLeaderboard()])
      .then(([qResult, lbResult]) => {
        if (!mounted) return;
        if (qResult.status === "fulfilled") {
          setPreviewQuestions(qResult.value ?? []);
        } else {
          const status = qResult.reason?.response?.status;
          setPreviewErrors(prev => ({ ...prev, questions: status === 404 ? "unavailable" : "error" }));
        }
        if (lbResult.status === "fulfilled") {
          setPreviewLeaderboard(lbResult.value ?? []);
        } else {
          const status = lbResult.reason?.response?.status;
          setPreviewErrors(prev => ({ ...prev, leaderboard: status === 404 ? "unavailable" : "error" }));
        }
        setPreviewLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="guest-wrap">
      <div className="guest-hero" style={{ "--gradient-hero": C.gradientHero }}>
        <div className="guest-hero-glow-1" style={{ "--accent": C.accent }} />
        <div className="guest-hero-glow-2" style={{ "--primary": C.primary }} />

        <div className="guest-hero-content">
          <div className="guest-hero-badge">
            <span>✨</span> Kenya's #1 peer learning platform
          </div>

          <h2 className="guest-hero-title">
            Learn together,<br />achieve more.
          </h2>
          <p className="guest-hero-desc">
            Join thousands of students sharing knowledge, build daily learning streaks, and forming study groups — all in one place. It's free to join.
          </p>

          <div className="guest-hero-actions">
            <button onClick={onRegister} className="guest-btn-primary" style={{ "--primary-dark": C.primaryDark }}>Get started free →</button>
            <button onClick={onLogin} className="guest-btn-secondary">Sign in</button>
          </div>
        </div>
      </div>

      <div className="guest-features-grid">
        {[
          { icon: "🔥", title: "Daily Streaks", desc: "Stay consistent. Earn streak badges for logging in and contributing every day.", bg: "warningLight" },
          { icon: "🏆", title: "Leaderboards", desc: "Compete weekly, earn points by answering questions and sharing resources.", bg: "primaryLight" },
          { icon: "👥", title: "Study Groups", desc: "Auto-matched groups based on your subjects. Schedule meets on Zoom or Google Meet.", bg: "accentLight" },
        ].map((f) => (
          <div key={f.title} className="guest-feature-card" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="guest-feature-icon" style={{ "--icon-bg": C[f.bg] }}>{f.icon}</div>
            <div className="guest-feature-title" style={{ "--text": C.text }}>{f.title}</div>
            <div className="guest-feature-desc" style={{ "--text-secondary": C.textSecondary }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="guest-columns">
        <div className="guest-column">
          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header" style={{ "--border": C.border }}>
              <div className="panel-title" style={{ "--text": C.text }}>Recent Questions</div>
              <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Browse what the community is discussing</div>
            </div>
            {previewLoading ? (
              <SkeletonCard height={90} />
            ) : previewQuestions.length === 0 ? (
              <SectionEmptyState status={previewErrors.questions} icon="💬" emptyTitle="No questions yet" emptyHint="Be the first to start a discussion." />
            ) : (
              <>
                <QuestionCard q={previewQuestions[0]} />
                {previewQuestions.length > 1 && (
                  <div className="locked-list-wrap">
                    {previewQuestions.slice(1, 3).map((q, i) => (
                      <QuestionCard key={q.id ?? i} q={q} blurred />
                    ))}
                    <div
                      className="locked-overlay"
                      style={{ "--locked-overlay-bg": C.themeMode === 'dark' ? "rgba(15,23,42,0.8)" : "rgba(248,250,252,0.7)" }}
                    >
                      <div className="locked-message" style={{ "--text": C.text }}>
                        Sign in to see all questions and join the discussion
                      </div>
                      <div className="locked-actions">
                        <button onClick={onLogin} className="locked-signin-btn" style={{ "--primary": C.primary }}>Sign in</button>
                        <button onClick={onRegister} className="locked-register-btn" style={{ "--surface-elevated": C.surfaceElevated, "--primary": C.primary, "--border": C.border }}>Register free</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="guest-column">
          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header with-action" style={{ "--border": C.border }}>
              <div>
                <div className="panel-title" style={{ "--text": C.text }}>🏆 Leaderboard</div>
                <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Top performers this week</div>
              </div>
              <Badge label="Weekly" bg={C.warningLight} color={C.warning} />
            </div>
            {previewLoading ? (
              <SkeletonCard height={140} />
            ) : previewLeaderboard.length === 0 ? (
              <SectionEmptyState status={previewErrors.leaderboard} icon="🏆" emptyTitle="No rankings yet" emptyHint="Rankings update weekly as the community gets active." />
            ) : (
              <>
                <div className="resources-list">
                  {previewLeaderboard.slice(0, 3).map((p, i) => <LeaderboardRow key={p.rank ?? i} p={{ ...p, isMe: false }} />)}
                </div>
                {previewLeaderboard.length > 3 && (
                  <div className="locked-leaderboard-wrap">
                    {previewLeaderboard.slice(3).map((p, i) => (
                      <div key={p.rank ?? i} className="locked-leaderboard-item">
                        <LeaderboardRow p={{ ...p, isMe: false }} />
                      </div>
                    ))}
                    <div
                      className="locked-leaderboard-overlay"
                      style={{ "--leaderboard-overlay-bg": C.themeMode === 'dark' ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.6)" }}
                    >
                      <button onClick={onLogin} className="locked-leaderboard-btn" style={{ "--primary": C.primary }}>
                        🔒 Sign in to see your rank
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionEmptyState({ status, emptyTitle, emptyHint, icon = "📭" }) {
  const { C } = useTheme();
  const copy = status === "unavailable"
    ? { icon: "🛠️", title: "Coming soon", hint: "This part of the dashboard isn't connected yet." }
    : status === "error"
      ? { icon: "⚠️", title: "Couldn't load this", hint: "Something went wrong fetching this section." }
      : { icon, title: emptyTitle, hint: emptyHint };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{copy.icon}</div>
      <div className="empty-state-title" style={{ "--text": C.text }}>{copy.title}</div>
      {copy.hint && <div className="empty-state-hint" style={{ "--text-secondary": C.textSecondary }}>{copy.hint}</div>}
    </div>
  );
}

function PartialOutageBanner({ missingLabels, onRetry, onDismiss }) {
  const { C } = useTheme();
  if (missingLabels.length === 0) return null;
  return (
    <div
      className="outage-banner"
      style={{ "--warning-light": C.warningLight, "--warning": C.warning, "--text": C.text }}
    >
      <div className="outage-banner-msg">
        <span className="outage-banner-icon">⚠️</span>
        <span>
          <strong>{missingLabels.length === 1 ? "One section" : `${missingLabels.length} sections`}</strong>{" "}
          couldn't load right now ({missingLabels.join(", ")}). The rest of your dashboard is up to date.
        </span>
      </div>
      <div className="outage-banner-actions">
        <button onClick={onRetry} className="outage-retry-btn" style={{ "--warning": C.warning }}>
          Retry
        </button>
        <button onClick={onDismiss} className="outage-dismiss-btn" style={{ "--text-secondary": C.textSecondary }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATED DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function DashboardView({ onViewProfile, onViewQuestions, onViewLeaderboard, onViewGroups }) {
  const { C } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [greeting, setGreeting] = useState("Good morning");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ cards: [], profile: {} });
  const [questions, setQuestions] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [resources, setResources] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchData = async () => {
      const calls = [
        ["user",          dashboardApi.getUser,          setUser],
        ["stats",         dashboardApi.getStats,         setStats],
        ["questions",     dashboardApi.getQuestions,     setQuestions],
        ["studyGroups",   dashboardApi.getStudyGroups,   setStudyGroups],
        ["notifications", dashboardApi.getNotifications, setNotifications],
        ["leaderboard",   dashboardApi.getLeaderboard,   setLeaderboard],
        ["resources",     dashboardApi.getResources,     setResources],
        ["activity",      dashboardApi.getActivity,      setActivity],
      ];

      const results = await Promise.allSettled(
        calls.map(async ([key, fn, setter]) => {
          const data = await fn();
          if (mounted) setter(data ?? (key === "stats" ? { cards: [], profile: {} } : []));
        })
      );

      if (!mounted) return;

      const nextErrors = {};
      results.forEach((result, i) => {
        if (result.status !== "rejected") return;
        const [key] = calls[i];
        const status = result.reason?.response?.status;
        if (status === 404) {
          nextErrors[key] = "unavailable";
        } else {
          nextErrors[key] = "error";
        }
      });
      setErrors(nextErrors);
      setLoading(false);
    };

    fetchData();
    return () => { mounted = false; };
  }, [refreshKey]);

  const retry = () => { setBannerDismissed(false); setRefreshKey(k => k + 1); };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton-stats-grid">
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={120} />)}
        </div>
        <div className="skeleton-columns">
          <div className="skeleton-col">
            <SkeletonCard height={200} />
            <SkeletonCard height={200} />
          </div>
          <div className="skeleton-col">
            <SkeletonCard height={250} />
            <SkeletonCard height={200} />
          </div>
        </div>
      </div>
    );
  }

  const sectionKeys = ["user", "stats", "questions", "studyGroups", "notifications", "leaderboard", "resources", "activity"];
  const failedCount = sectionKeys.filter(k => errors[k]).length;
  const allFailed = failedCount === sectionKeys.length;

  if (allFailed) {
    const anyUnavailable = sectionKeys.some(k => errors[k] === "unavailable");
    return (
      <div
        className="full-error-state"
        style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}
      >
        <div className="full-error-icon">📊</div>
        <div className="full-error-title" style={{ "--text": C.text }}>
          {anyUnavailable ? "Setting up your profile space" : "We're having trouble connecting"}
        </div>
        <div className="full-error-desc" style={{ "--text-secondary": C.textSecondary }}>
          {anyUnavailable
            ? "Welcome to the dashboard! These endpoints aren't wired up on the backend yet — once they are, your data will show up here automatically."
            : "We couldn't reach the server just now. Check your connection and try again."}
        </div>
        <button onClick={retry} className="full-error-retry-btn" style={{ "--primary": C.primary }}>
          Try again
        </button>
      </div>
    );
  }

  const safeUser = user ?? { role: "Member" };
  // joined_date already comes pre-formatted ("July 2026") from
  // UserProfileSerializer.joined_date — there's no raw date_joined field
  // on this endpoint to re-parse.
  const joinedDate = user?.joined_date ?? null;

  // Profile-strip only shows fields the users app actually owns
  // (points_total/streak_count/rank_position on the User model, via
  // /auth/me/). Questions asked / answers given / resources shared live
  // in other apps (forum, resources) and aren't represented here, so
  // they're intentionally left off rather than faked from another
  // endpoint.
  const safeProfile = {
    points: user?.points_total ?? 0,
    streak: user?.streak_count ?? 0,
    rankPosition: user?.rank_position ?? "—",
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    dashboardApi.markNotificationRead(id).catch(console.error);
  };
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    dashboardApi.markAllNotificationsRead().catch(console.error);
  };
  const filteredQuestions = activeTab === "all" ? questions : questions.filter(q => q.status === activeTab);

  const sectionLabels = {
    user: "Profile", stats: "Stats", questions: "Questions", studyGroups: "Study Groups",
    notifications: "Notifications", leaderboard: "Leaderboard", resources: "Resources", activity: "Activity",
  };
  const missingLabels = bannerDismissed ? [] : sectionKeys.filter(k => errors[k]).map(k => sectionLabels[k]);

  return (
    <div className="dashboard-view">
      <PartialOutageBanner
        missingLabels={missingLabels}
        onRetry={retry}
        onDismiss={() => setBannerDismissed(true)}
      />
      <div
        className="dashboard-greeting-card"
        style={{ "--surface-elevated": C.surfaceElevated, "--primary-light": C.primaryLight, "--border": C.border }}
      >
        <div className="dashboard-greeting-glow-wrap">
          <div className="dashboard-greeting-glow" style={{ "--primary": C.primary }} />
        </div>
        <div className="dashboard-greeting-text">
          <div className="dashboard-greeting-title" style={{ "--text": C.text }}>
            {greeting}, {getDisplayName(safeUser)}
          </div>
          <div className="dashboard-greeting-sub" style={{ "--text-secondary": C.textSecondary }}>Here's what's happening in your learning community today.</div>
        </div>
        <div className="dashboard-greeting-actions">
          <div className="dashboard-search" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <span className="dashboard-search-icon" style={{ "--text-secondary": C.textSecondary }}>🔍</span>
            <input
              type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dashboard-search-input"
              style={{ "--text": C.text }}
            />
          </div>

          <div className="dashboard-streak-badge" style={{ "--primary": C.primary }}>
            <span className="dashboard-streak-icon">🔥</span>{safeProfile.streak}-day streak
          </div>

          <div className="notif-bell-wrap">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="notif-bell-btn"
              style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow, "--text": C.text }}
            >🔔</button>
            {unreadCount > 0 && (
              <div className="notif-badge-count" style={{ "--danger": C.danger, "--surface-elevated": C.surfaceElevated }}>
                {unreadCount}
              </div>
            )}
            {notifOpen && (
              <div className="notif-dropdown" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border }}>
                <div className="notif-dropdown-header" style={{ "--border": C.border }}>
                  <div className="notif-dropdown-title" style={{ "--text": C.text }}>Notifications</div>
                  <button onClick={markAllRead} className="notif-mark-all-btn" style={{ "--primary": C.primary }}>Mark all read</button>
                </div>
                <div className="notif-list">
                  {notifications.length > 0
                    ? notifications.map(n => <NotifItem key={n.id} n={n} onRead={markAsRead} />)
                    : <SectionEmptyState status={errors.notifications} icon="🔔" emptyTitle="No notifications" emptyHint="You're all caught up." />}
                </div>
              </div>
            )}
          </div>

          <Avatar initials={getInitials(safeUser)} color={C.accent} size={40} ring />
        </div>
      </div>

      <div className="stats-grid">
        {stats.cards?.length > 0
          ? stats.cards.map((s, i) => <StatCard key={i} stat={s} />)
          : <SectionEmptyState status={errors.stats} icon="📈" emptyTitle="No stats yet" emptyHint="Stats will appear once there's activity to measure." />}
      </div>

      <div
        className="profile-strip"
        style={{ "--surface-elevated": C.surfaceElevated, "--primary-light": C.primaryLight, "--border": C.border, "--card-shadow": C.cardShadow }}
      >
        <div className="profile-strip-user">
          <Avatar initials={getInitials(safeUser)} color={C.accent} size={42} ring />
          <div>
            <div className="profile-strip-name" style={{ "--text": C.text }}>{getDisplayName(safeUser)}</div>
            <div className="profile-strip-role" style={{ "--text-secondary": C.textSecondary }}>{safeUser.role}{joinedDate ? ` · Joined ${joinedDate}` : ""}</div>
          </div>
        </div>
        {[
          { label: "Points", value: safeProfile.points, color: C.primary },
          { label: "Streak", value: `${safeProfile.streak}d`, color: C.accent },
          { label: "Rank", value: `#${safeProfile.rankPosition}`, color: C.danger },
        ].map((s) => (
          <div key={s.label} className="profile-stat" style={{ "--border": C.border }}>
            <div className="profile-stat-value" style={{ "--stat-color": s.color }}>{s.value}</div>
            <div className="profile-stat-label" style={{ "--text-secondary": C.textSecondary }}>{s.label}</div>
          </div>
        ))}
        <div className="profile-strip-actions" style={{ "--border": C.border }}>
          <button onClick={onViewProfile} className="profile-strip-view-btn" style={{ "--primary": C.primary }}>View profile →</button>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-col-main">
          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header with-action" style={{ "--border": C.border }}>
              <div>
                <div className="panel-title" style={{ "--text": C.text }}>Recent Questions</div>
                <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Latest discussions from your community</div>
              </div>
              <div className="tab-buttons">
                {["all", "open", "resolved"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="tab-btn"
                    style={{ "--tab-bg": activeTab === tab ? C.primary : C.surface, "--tab-color": activeTab === tab ? "#fff" : C.textSecondary }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="question-list">
              {filteredQuestions.length > 0
                ? filteredQuestions.map(q => <QuestionCard key={q.id} q={q} />)
                : <SectionEmptyState status={errors.questions} icon="💬" emptyTitle="No questions yet" emptyHint="Be the first to start a discussion." />}
            </div>
            <button onClick={onViewQuestions} className="view-all-btn" style={{ "--border": C.border, "--surface": C.surface, "--primary": C.primary }}>
              View all questions →
            </button>
          </div>

          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header with-action" style={{ "--border": C.border }}>
              <div>
                <div className="panel-title" style={{ "--text": C.text }}>Study Groups</div>
                <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Collaborate with peers in real-time</div>
              </div>
              <button onClick={onViewGroups} className="view-groups-btn" style={{ "--primary": C.primary }}>
                View Groups →
              </button>
            </div>
            <div className="groups-grid">
              {studyGroups.length > 0
                ? studyGroups.map(g => <StudyGroupCard key={g.id} group={g} />)
                : <SectionEmptyState status={errors.studyGroups} icon="👥" emptyTitle="No study groups yet" emptyHint="Create one to start collaborating with peers." />}
            </div>
          </div>

          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header" style={{ "--border": C.border }}>
              <div className="panel-title" style={{ "--text": C.text }}>Top Resources</div>
              <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Community-curated learning materials</div>
            </div>
            <div className="resources-list">
              {resources.length > 0
                ? resources.map(r => <ResourceCard key={r.id} r={r} />)
                : <SectionEmptyState status={errors.resources} icon="📚" emptyTitle="No resources yet" emptyHint="Shared resources will show up here." />}
            </div>
          </div>
        </div>

        <div className="dashboard-col-side">
          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header with-action" style={{ "--border": C.border }}>
              <div>
                <div className="panel-title" style={{ "--text": C.text }}>🏆 Leaderboard</div>
                <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>Top performers this week</div>
              </div>
              <Badge label="Weekly" bg={C.warningLight} color={C.warning} />
            </div>
            <div className="resources-list">
              {leaderboard.length > 0
                ? leaderboard.map(p => <LeaderboardRow key={p.rank} p={p} />)
                : <SectionEmptyState status={errors.leaderboard} icon="🏆" emptyTitle="No rankings yet" emptyHint="Rankings update weekly as the community gets active." />}
            </div>
            <button onClick={onViewLeaderboard} className="view-full-leaderboard-btn" style={{ "--primary-light": C.primaryLight, "--primary": C.primary }}>
              View full leaderboard →
            </button>
          </div>

          <div className="panel" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <div className="panel-header" style={{ "--border": C.border }}>
              <div className="panel-title" style={{ "--text": C.text }}>⚡ Live Activity</div>
              <div className="panel-subtitle" style={{ "--text-secondary": C.textSecondary }}>What's happening right now</div>
            </div>
            <div>
              {activity.length > 0
                ? activity.map(a => <ActivityItem key={a.id} activity={a} />)
                : <SectionEmptyState status={errors.activity} icon="⚡" emptyTitle="No recent activity" emptyHint="Live activity will appear here as it happens." />}
            </div>
          </div>

          <div className="quick-actions-card" style={{ "--gradient-hero": C.gradientHero }}>
            <div className="quick-actions-title">Quick Actions</div>
            <div className="quick-actions-sub">Get things done faster</div>
            <div className="quick-actions-list">
              {[
                { icon: "💬", label: "Ask a question", desc: "Get help from the community", path: "/forum/ask" },
                { icon: "👥", label: "Join a study group", desc: "Collaborate with peers", path: "/groups" },
                { icon: "📚", label: "Share a resource", desc: "Contribute to the library", path: "/resources" },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} className="quick-action-btn">
                  <span className="quick-action-icon">{action.icon}</span>
                  <div className="quick-action-text">
                    <div className="quick-action-label">{action.label}</div>
                    <div className="quick-action-desc">{action.desc}</div>
                  </div>
                  <span className="quick-action-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  PLACEHOLDER VIEW
// ═════════════════════════════════════════════════════════════════════════════
function PlaceholderView({ label, icon, hint }) {
  const { C } = useTheme();
  return (
    <div className="placeholder-view" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
      <div className="placeholder-icon">{icon}</div>
      <div className="placeholder-label" style={{ "--text": C.text }}>{label}</div>
      <div className="placeholder-hint" style={{ "--text-secondary": C.textSecondary }}>
        {hint || "This section is coming soon. We're working hard to bring you an amazing experience."}
      </div>
    </div>
  );
}

// ─── Forum sub-router ─────────────────────────────────────────────────────────
function ForumSection() {
  const { themeMode, toggleTheme } = useTheme();
  return <QuestionFeed themeMode={themeMode} onToggleTheme={toggleTheme}/>;
}

// ─── Resources section wrapper ────────────────────────────────────────────────
function ResourcesSection() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <ResourceList onAdd={() => setShowForm(true)} />
      {showForm && (
        <div className="resource-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="resource-modal">
            <ResourceForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Gamification section ─────────────────────────────────────────────────────
function GamificationSection() {
  const { themeMode, toggleTheme } = useTheme();
  return <GamificationDashboard themeMode={themeMode} onToggleTheme={toggleTheme} />;
}

// ─── Profile section ───────────────────────────────────────────────────────────
function ProfileSection() {
  const { C } = useTheme();
  return <ProfilePage C={C} />;
}

// --- Study Groups section -------------------------------------------------------
function GroupsSection() {
  const [viewingGroupId, setViewingGroupId] = useState(null);
  const [chattingGroupId, setChattingGroupId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    dashboardApi.getUser()
      .then(data => { if (mounted) setCurrentUser(data); })
      .catch(err => console.error("GroupsSection: failed to load current user", err));
    return () => { mounted = false; };
  }, []);

  if (chattingGroupId) {
    return (
      <ChatRoom
        groupId={chattingGroupId}
        currentUserId={currentUser?.id}
        onBack={() => setChattingGroupId(null)}
      />
    );
  }

  if (viewingGroupId) {
    return (
      <GroupDetail
        groupId={viewingGroupId}
        onBack={() => setViewingGroupId(null)}
        onOpenChat={(id) => setChattingGroupId(id)}
      />
    );
  }

  return (
    <GroupList
      onAdd={() => {}}
      onView={(id) => setViewingGroupId(id)}
    />
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function ActiveSection({ active }) {
  switch (active) {
    case "forum":        return <ForumSection />;
    case "resources":    return <ResourcesSection />;
    case "gamification": return <GamificationSection />;
    case "profile":      return <ProfileSection />;
    case "groups":       return <GroupsSection />;
    default:             return null;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function MainDashboard() {
  const { C } = useTheme(); // Consuming global context directly
  const [active, setActive] = useLocalStorage('educonnect-active-tab', 'dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setUser(null); return; }
    let mounted = true;
    dashboardApi.getUser()
      .then(data => { if (mounted) setUser(data); })
      .catch(err => console.error("Sidebar: failed to load current user", err));
    return () => { mounted = false; };
  }, [isLoggedIn]);

  const handleNav = (key) => {
    if (!isLoggedIn && key !== "dashboard" && key !== "forum") return;
    setActive(key);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleToggleCollapse = () => setCollapsed(c => !c);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    setUser(null);
    setActive('dashboard');
  };

  return (
    <div
      className="dashboard-root"
      style={{
        "--bg": C.bg,
        "--scrollbar-thumb": C.scrollbarThumb,
        "--scrollbar-thumb-hover": C.scrollbarThumbHover,
      }}
    >
      <Sidebar
        active={active}
        onNav={handleNav}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className={`dashboard-main${isMobile ? " is-mobile" : ""}`}>
        {isMobile && (
          <div className="mobile-topbar" style={{ "--surface-elevated": C.surfaceElevated, "--border": C.border, "--card-shadow": C.cardShadow }}>
            <button onClick={() => setMobileMenuOpen(true)} className="mobile-topbar-menu-btn" style={{ "--text": C.text }}>☰</button>
            <div className="mobile-topbar-title" style={{ "--text": C.text }}>EduConnect</div>
            <div className="mobile-topbar-spacer" />
          </div>
        )}

        {active === "dashboard"
          ? (isLoggedIn
              ? <DashboardView
                  onViewProfile={() => handleNav('profile')}
                  onViewQuestions={() => handleNav('forum')}
                  onViewLeaderboard={() => handleNav('gamification')}
                  onViewGroups={() => handleNav('groups')}
                />
              : <GuestPromoPanel />
            )
          : ["forum", "resources", "gamification", "profile", "groups"].includes(active)
            ? <ActiveSection active={active} />
            : <PlaceholderView
                label={NAV_ITEMS.find(n => n.key === active)?.label ?? active}
                icon={NAV_ITEMS.find(n => n.key === active)?.icon ?? "🔒"}
              />
        }
      </main>
    </div>
  );
}