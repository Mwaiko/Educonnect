import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import QuestionFeed       from "./forum/QuestionFeed";
import AskQuestionForm    from "./forum/AskQuestionForm";
import QuestionDetailPage from "./forum/QuestionDetailPage";
import GamificationDashboard from "./gamification/GamificationDashboard";
import ResourceList       from "./Resources/ResourceList";
import ResourceForm       from "./Resources/ResourceForm";
import ProfilePage        from "./profile/ProfilePage";
import GroupList          from "./Groups/GroupList";
// ═════════════════════════════════════════════════════════════════════════════
//  THEME SYSTEM — Light & Dark Mode
// ═════════════════════════════════════════════════════════════════════════════

const THEMES = {
  light: {
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

// ═════════════════════════════════════════════════════════════════════════════
//  API — real backend calls via axios instance
// ═════════════════════════════════════════════════════════════════════════════
const dashboardApi = {
  getUser:          () => api.get("/auth/me/").then(r => r.data),
  getStats:         () => api.get("/dashboard/stats/").then(r => r.data),
  getQuestions:     () => api.get("/forum/questions/?page_size=5&ordering=-created_at").then(r => r.data.results ?? r.data),
  getStudyGroups:   () => api.get("/groups/?page_size=5").then(r => r.data.results ?? r.data),
  getNotifications: () => api.get("/notifications/").then(r => r.data.results ?? r.data),
  getLeaderboard:   () => api.get("/gamification/leaderboard/?timeframe=weekly").then(r => r.data.leaderboard ?? r.data),
  getResources:     () => api.get("/resources/?page_size=5&ordering=-net_votes").then(r => r.data.results ?? r.data),
  getActivity:      () => api.get("/dashboard/activity/").then(r => r.data.results ?? r.data),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllNotificationsRead: () => api.post("/notifications/mark-all-read/"),
};

// ═════════════════════════════════════════════════════════════════════════════
//  MOCK DATA — used for guest/logged-out preview panels (GuestPromoPanel)
// ═════════════════════════════════════════════════════════════════════════════
const MOCK_DB = {
  questions: [
    {
      title: "How do I approach dynamic programming problems?",
      body: "I keep getting stuck identifying the subproblems. Any frameworks or tips that helped you?",
      tags: ["Algorithms"],
      status: "resolved",
      author: "JK",
      authorColor: "primary",
      time: "2h ago",
      answers: 6,
      upvotes: 14,
    },
    {
      title: "Difference between BFS and DFS in weighted graphs?",
      body: "Trying to understand when one is more appropriate than the other for shortest-path problems.",
      tags: ["Graphs"],
      status: "open",
      author: "AM",
      authorColor: "accent",
      time: "4h ago",
      answers: 3,
      upvotes: 9,
    },
    {
      title: "Best way to normalize a database schema for a course project?",
      body: "Working on a student records system and want to avoid redundancy without over-engineering it.",
      tags: ["Databases", "SQL"],
      status: "open",
      author: "TN",
      authorColor: "success",
      time: "6h ago",
      answers: 2,
      upvotes: 5,
    },
  ],
  leaderboard: [
    { rank: 1, initials: "WK", name: "Wanjiru K.", color: "warning", streak: 21, points: 2480 },
    { rank: 2, initials: "OD", name: "Otieno D.", color: "primary", streak: 14, points: 2210 },
    { rank: 3, initials: "FM", name: "Faith M.", color: "accent", streak: 9, points: 1990 },
    { rank: 4, initials: "KN", name: "Kevin N.", color: "success", streak: 6, points: 1640 },
    { rank: 5, initials: "AL", name: "Amina L.", color: "danger", streak: 4, points: 1420 },
  ],
};

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

function useTheme() {
  const [themeMode, setThemeMode] = useLocalStorage('educonnect-theme', 'light');
  const C = THEMES[themeMode];
  const toggleTheme = () => setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  return { C, themeMode, toggleTheme };
}

// ═════════════════════════════════════════════════════════════════════════════
//  SHARED SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
function Avatar({ initials, color, size = 36, overlap = false, ring = false, C }) {
  const resolvedColor = C[color] || color || C.primary;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: resolvedColor, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 600,
      border: overlap ? "2px solid " + (C.themeMode === 'dark' ? C.surfaceElevated : "#fff") : ring ? `2px solid ${resolvedColor}` : "none",
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${resolvedColor}22` : "none",
      transition: "transform 0.2s ease",
    }}>{initials}</div>
  );
}

function Badge({ label, bg, color, icon, C }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 500,
      background: bg || C.primaryLight, color: color || C.primary,
      transition: "all 0.2s ease", cursor: "default",
    }}>
      {icon && <span style={{ fontSize: 10 }}>{icon}</span>}
      {label}
    </span>
  );
}

function LoadingSpinner({ C }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `3px solid ${C.border}`,
        borderTopColor: C.primary,
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

function SkeletonCard({ C, height = 80 }) {
  const [opacity, setOpacity] = useState(0.5);
  useEffect(() => {
    const interval = setInterval(() => setOpacity(prev => prev === 0.5 ? 0.8 : 0.5), 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{
      height, borderRadius: 12,
      background: C.surface,
      opacity,
      transition: "opacity 0.4s ease",
      border: `1px solid ${C.border}`,
    }} />
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

function Sidebar({ active, onNav, collapsed, onToggleCollapse, isLoggedIn, onLogout, C, themeMode, onToggleTheme, isMobile, mobileOpen, onCloseMobile }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const sidebarContent = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", justifyContent: collapsed ? "center" : "flex-start" }}>
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, color: "rgba(255,255,255,0.7)", cursor: "pointer",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, transition: "all 0.2s ease",
            }}
          >
            →
          </button>
        ) : (
          <>
            <div style={{ width: 38, height: 38, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <div style={{ width: 22, height: 22, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>EduConnect</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>Peer Learning</div>
            </div>
            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, color: "rgba(255,255,255,0.7)", cursor: "pointer",
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0, transition: "all 0.2s ease",
                }}
              >
                ←
              </button>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div style={{ padding: "12px 20px 0" }}>
          <button
            onClick={onToggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: 16 }}>{themeMode === 'light' ? '🌙' : '☀️'}</span>
            <span>{themeMode === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      )}

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          const isHovered = hoveredItem === item.key;
          const isLocked = !isLoggedIn && item.key !== "dashboard" && item.key !== "forum";
          return (
            <button
              key={item.key}
              onClick={() => { if (!isLocked) { onNav(item.key); if (isMobile) onCloseMobile(); } }}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: collapsed ? "12px" : "11px 16px", marginBottom: 4,
                background: isActive ? "rgba(255,255,255,0.12)" : isHovered ? "rgba(255,255,255,0.06)" : "transparent",
                border: "none", borderRadius: 10,
                cursor: isLocked ? "not-allowed" : "pointer",
                color: isActive ? "#fff" : isLocked ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.55)",
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s ease", position: "relative",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: `linear-gradient(180deg, ${C.accent}, ${C.primary})`, borderRadius: "0 3px 3px 0" }} />
              )}
              <span style={{ fontSize: 18, filter: isActive ? "grayscale(0)" : "grayscale(0.3)", transition: "filter 0.2s ease" }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {item.label}
                  {isLocked && <span style={{ fontSize: 11, opacity: 0.5 }}>🔒</span>}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {isLoggedIn ? (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials="IK" color={C.accent} size={36} ring C={C} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Ian Kimathi</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Student</div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: 16, padding: 4, borderRadius: 6,
                  transition: "all 0.2s ease",
                }}
              >🚪</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  display: "block", textAlign: "center", padding: "9px",
                  borderRadius: 10, background: "rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
                  width: "100%", fontFamily: "inherit",
                }}
              >Sign in</button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  display: "block", textAlign: "center", padding: "9px",
                  borderRadius: 10, background: `linear-gradient(90deg, ${C.primary}, #7C3AED)`,
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  boxShadow: `0 4px 12px ${C.primary}40`,
                  border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit",
                }}
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
          <div style={{
            position: "fixed", inset: 0, background: C.modalOverlay, zIndex: 998,
            animation: "fadeIn 0.2s ease",
          }} onClick={onCloseMobile} />
        )}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 260,
          background: C.sidebarBg,
          display: "flex", flexDirection: "column",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden", zIndex: 999,
          boxShadow: "4px 0 24px rgba(49,46,129,0.3)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      flexShrink: 0,
      background: C.sidebarBg,
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden", height: "100vh", position: "sticky", top: 0,
      boxShadow: "4px 0 24px rgba(49,46,129,0.2)",
    }}>
      {sidebarContent}
    </aside>
  );
}

function StatCard({ stat, C }) {
  const [hovered, setHovered] = useState(false);
  const colorValue = C[stat.color] || stat.color;
  const animatedValue = useAnimatedCounter(stat.value);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surfaceElevated,
        border: `1px solid ${hovered ? colorValue : C.border}`,
        borderRadius: 14, padding: "20px 22px",
        borderTop: `3px solid ${colorValue}`,
        display: "flex", flexDirection: "column", gap: 6,
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? C.hoverShadow : C.cardShadow,
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: hovered ? `linear-gradient(135deg, ${colorValue}08, transparent)` : "transparent",
        transition: "background 0.35s ease", pointerEvents: "none",
      }} />
      <div style={{ fontSize: 24, position: "relative", zIndex: 1 }}>{stat.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: C.textSecondary, position: "relative", zIndex: 1 }}>{stat.label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: colorValue, lineHeight: 1.1, position: "relative", zIndex: 1 }}>{animatedValue}</div>
      <div style={{ fontSize: 11, color: stat.delta.startsWith("+") ? C.success : C.textSecondary, display: "flex", alignItems: "center", gap: 4, position: "relative", zIndex: 1 }}>
        {stat.delta.startsWith("+") && <span style={{ fontSize: 10 }}>↑</span>}
        {stat.delta}
      </div>
    </div>
  );
}

function QuestionCard({ q, blurred = false, C }) {
  const [hovered, setHovered] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const tagColors = {
    Algorithms: [C.primaryLight, C.primary],
    Graphs: [C.themeMode === 'dark' ? "rgba(148,163,184,0.15)" : "#F1F5F9", C.themeMode === 'dark' ? "#94A3B8" : "#475569"],
    "Operating Systems": [C.accentLight, C.themeMode === 'dark' ? C.accent : "#0E7490"],
    Databases: [C.successLight, C.themeMode === 'dark' ? C.success : "#065F46"],
    SQL: [C.themeMode === 'dark' ? "rgba(251,191,36,0.15)" : "#FEF3C7", C.themeMode === 'dark' ? C.warning : "#92400E"],
  };
  const authorColor = C[q.authorColor] || q.authorColor;
  return (
    <div
      onMouseEnter={() => !blurred && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surfaceElevated,
        border: `1px solid ${hovered ? C.primary : C.border}`,
        borderRadius: 12, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        cursor: blurred ? "default" : "pointer",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 12px rgba(79,70,229,0.08)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        filter: blurred ? "blur(3px)" : "none",
        userSelect: blurred ? "none" : "auto",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8 }}>
            {q.title}
            {q.status === "resolved" && <Badge label="Resolved" bg={C.successLight} color={C.success} icon="✓" C={C} />}
          </div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{q.body}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {q.tags.map(tag => (
              <Badge key={tag} label={tag} bg={tagColors[tag]?.[0]} color={tagColors[tag]?.[1]} C={C} />
            ))}
            <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <Avatar initials={q.author} color={authorColor} size={20} C={C} />
              <span>{q.time}</span>
              <span style={{ color: C.border }}>•</span>
              <span>{q.answers} answers</span>
            </span>
          </div>
        </div>
        {!blurred && (
          <button
            onClick={(e) => { e.stopPropagation(); setUpvoted(!upvoted); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0,
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8,
              transition: "all 0.2s ease",
              backgroundColor: upvoted ? `${C.primary}11` : "transparent",
            }}
          >
            <div style={{ fontSize: 18, color: upvoted ? C.primary : C.textSecondary, transform: upvoted ? "scale(1.2)" : "scale(1)", transition: "all 0.2s ease" }}>⬆</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: upvoted ? C.primary : C.textSecondary }}>{q.upvotes + (upvoted ? 1 : 0)}</div>
          </button>
        )}
      </div>
    </div>
  );
}

function NotifItem({ n, onRead, C }) {
  const [hovered, setHovered] = useState(false);
  const colorValue = C[n.color] || n.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRead && onRead(n.id)}
      style={{
        display: "flex", gap: 12, padding: "12px 14px",
        borderLeft: `3px solid ${colorValue}`,
        background: n.read ? C.surface : `${colorValue}11`,
        borderRadius: "0 10px 10px 0",
        opacity: n.read ? 0.7 : 1,
        cursor: "pointer",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.25s ease", position: "relative",
      }}
    >
      {!n.read && (
        <div style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%", background: colorValue, animation: "pulse 2s infinite" }} />
      )}
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: colorValue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, boxShadow: `0 2px 8px ${colorValue}40` }}>{n.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, fontWeight: n.read ? 400 : 500 }}>{n.text}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10 }}>🕐</span>{n.time}
        </div>
      </div>
    </div>
  );
}

function StudyGroupCard({ group, C }) {
  const [hovered, setHovered] = useState(false);
  const [joined, setJoined] = useState(false);
  const colorValue = C[group.color] || group.color;
  const progress = (group.members / group.max) * 100;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surfaceElevated, border: `1px solid ${hovered ? colorValue : C.border}`,
        borderRadius: 14, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 20px ${colorValue}12` : C.cardShadow,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${colorValue}, ${colorValue}88)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{group.name}</div>
          <div style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10 }}>📅</span>{group.meeting}
          </div>
        </div>
        <Badge label={group.provider} bg={`${colorValue}15`} color={colorValue} C={C} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textSecondary }}>Members</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: group.members === group.max ? C.danger : C.text }}>{group.members}/{group.max}</span>
          </div>
          <div style={{ height: 6, background: C.themeMode === 'dark' ? "rgba(255,255,255,0.1)" : "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${colorValue}, ${colorValue}CC)`, borderRadius: 99, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", marginLeft: 4 }}>
          {group.avatars.map((av, i) => (
            <Avatar key={i} initials={av} color={i === 0 ? colorValue : i === 1 ? C.accent : C.success} size={28} overlap C={C} />
          ))}
          {group.members > group.avatars.length && (
            <Avatar initials={`+${group.members - group.avatars.length}`} color="#E2E8F0" size={28} overlap C={C} />
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
          style={{
            padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s ease",
            background: joined ? C.successLight : colorValue,
            color: joined ? C.success : "#fff",
          }}
        >
          {joined ? "✓ Joined" : "Join"}
        </button>
      </div>
    </div>
  );
}

function LeaderboardRow({ p, C }) {
  const [hovered, setHovered] = useState(false);
  const isTop3 = p.rank <= 3;
  const rankIcons = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colorValue = C[p.color] || p.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
        background: p.isMe ? `${C.accent}08` : hovered ? C.surface : "transparent",
        border: p.isMe ? `1px solid ${C.accent}30` : "1px solid transparent",
        transition: "all 0.2s ease", cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: isTop3 ? colorValue : C.textSecondary, minWidth: 28, textAlign: "center" }}>
        {isTop3 ? rankIcons[p.rank] : `#${p.rank}`}
      </span>
      <Avatar initials={p.initials} color={colorValue} size={32} ring={p.isMe} C={C} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: p.isMe ? 600 : 500, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
          {p.name}
          {p.isMe && <Badge label="You" bg={C.accentLight} color={C.accent} C={C} />}
        </div>
        <div style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 10 }}>🔥</span>{p.streak}-day streak
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colorValue, display: "flex", alignItems: "center", gap: 4 }}>
        {p.points}<span style={{ fontSize: 10, fontWeight: 500, color: C.textSecondary }}>pts</span>
      </div>
    </div>
  );
}

function ResourceCard({ r, C }) {
  const [hovered, setHovered] = useState(false);
  const [voted, setVoted] = useState(false);
  const colorValue = C[r.color] || r.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surfaceElevated, border: `1px solid ${hovered ? colorValue : C.border}`,
        borderRadius: 12, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? `0 4px 12px ${colorValue}10` : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${colorValue}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {r.type === "Website" ? "🌐" : "📖"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.title}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
          <Badge label={r.subject} bg={`${colorValue}15`} color={colorValue} C={C} />
          <span>by {r.submitter}</span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setVoted(!voted); }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8,
          transition: "all 0.2s ease",
          backgroundColor: voted ? `${C.primary}11` : "transparent",
        }}
      >
        <div style={{ fontSize: 16, color: voted ? C.primary : C.textSecondary, transform: voted ? "scale(1.15)" : "scale(1)", transition: "all 0.2s ease" }}>▲</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: voted ? C.primary : C.textSecondary }}>{r.votes + (voted ? 1 : 0)}</div>
      </button>
    </div>
  );
}

function ActivityItem({ activity, C }) {
  const [hovered, setHovered] = useState(false);
  const colorValue = C[activity.color] || activity.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
        opacity: hovered ? 1 : 0.85, transition: "opacity 0.2s ease", cursor: "pointer",
      }}
    >
      <Avatar initials={activity.avatar} color={colorValue} size={30} C={C} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
          <strong>{activity.user}</strong>{" "}
          <span style={{ color: C.textSecondary }}>{activity.action}</span>{" "}
          <span style={{ color: C.primary, fontWeight: 500 }}>{activity.target}</span>
        </div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{activity.time}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  GUEST LANDING
// ═════════════════════════════════════════════════════════════════════════════
function GuestPromoPanel({ C }) {
  const navigate = useNavigate();
  const onLogin    = () => navigate("/login");
  const onRegister = () => navigate("/register");

  const stats = [
    { value: "12,400+", label: "Students", icon: "🎓" },
    { value: "38,000+", label: "Questions answered", icon: "💬" },
    { value: "4,200+", label: "Study groups", icon: "👥" },
    { value: "9,100+", label: "Resources shared", icon: "📚" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: C.gradientHero,
        borderRadius: 20, padding: "40px 40px",
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}22, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: 200, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}30, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 580 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 99, padding: "5px 14px", fontSize: 12, fontWeight: 500,
            color: "rgba(255,255,255,0.8)", marginBottom: 20,
          }}>
            <span style={{ fontSize: 14 }}>✨</span> Kenya's #1 peer learning platform
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Learn together,<br />achieve more.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: "0 0 28px", maxWidth: 480 }}>
            Join thousands of students sharing knowledge, build daily learning streaks, and forming study groups — all in one place. It's free to join.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onRegister} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 26px", borderRadius: 12,
              background: "#fff", color: C.primaryDark,
              fontSize: 14, fontWeight: 700, border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease", cursor: "pointer",
            }}>Get started free →</button>
            <button onClick={onLogin} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 26px", borderRadius: 12,
              background: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: 14, fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.2s ease", cursor: "pointer",
            }}>Sign in</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: C.surfaceElevated, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            boxShadow: C.cardShadow,
          }}>
            <span style={{ fontSize: 26 }}>{s.icon}</span>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, textAlign: "center" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        {[
          { icon: "🔥", title: "Daily Streaks", desc: "Stay consistent. Earn streak badges for logging in and contributing every day.", color: "warning", bg: "warningLight" },
          { icon: "🏆", title: "Leaderboards", desc: "Compete weekly, earn points by answering questions and sharing resources.", color: "primary", bg: "primaryLight" },
          { icon: "👥", title: "Study Groups", desc: "Auto-matched groups based on your subjects. Schedule meets on Zoom or Google Meet.", color: "accent", bg: "accentLight" },
        ].map((f) => (
          <div key={f.title} style={{
            background: C.surfaceElevated, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "22px",
            display: "flex", flexDirection: "column", gap: 12,
            boxShadow: C.cardShadow,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C[f.bg], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{f.title}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Recent Questions</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>Browse what the community is discussing</div>
            </div>
            <QuestionCard q={MOCK_DB.questions[0]} C={C} />
            <div style={{ position: "relative", marginTop: 12 }}>
              <QuestionCard q={MOCK_DB.questions[1]} blurred C={C} />
              <QuestionCard q={MOCK_DB.questions[2]} blurred C={C} />
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 14,
                background: C.themeMode === 'dark' ? "rgba(15,23,42,0.8)" : "rgba(248,250,252,0.7)",
                borderRadius: 12, backdropFilter: "blur(2px)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, textAlign: "center" }}>
                  Sign in to see all questions and join the discussion
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={onLogin} style={{ padding: "8px 20px", borderRadius: 10, background: C.primary, color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Sign in</button>
                  <button onClick={onRegister} style={{ padding: "8px 20px", borderRadius: 10, background: C.surfaceElevated, color: C.primary, fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, cursor: "pointer" }}>Register free</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>🏆 Leaderboard</div>
                <div style={{ fontSize: 12, color: C.textSecondary }}>Top performers this week</div>
              </div>
              <Badge label="Weekly" bg={C.warningLight} color={C.warning} C={C} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {MOCK_DB.leaderboard.slice(0, 3).map(p => <LeaderboardRow key={p.rank} p={{ ...p, isMe: false }} C={C} />)}
            </div>
            <div style={{ position: "relative", marginTop: 4 }}>
              {MOCK_DB.leaderboard.slice(3).map(p => (
                <div key={p.rank} style={{ filter: "blur(4px)", pointerEvents: "none" }}>
                  <LeaderboardRow p={{ ...p, isMe: false }} C={C} />
                </div>
              ))}
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: C.themeMode === 'dark' ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.6)",
                backdropFilter: "blur(1px)", borderRadius: 8,
              }}>
                <button onClick={onLogin} style={{ fontSize: 12, color: C.primary, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  🔒 Sign in to see your rank
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Helpers for eloquent degraded states (missing/404'd endpoints, empty data)
// ═════════════════════════════════════════════════════════════════════════════

// Renders inline wherever a section has nothing to show — either because the
// backend genuinely has no data yet, or because that section's endpoint
// 404'd / errored. Message adapts to which case it is.
function SectionEmptyState({ C, status, emptyTitle, emptyHint, icon = "📭" }) {
  const copy = status === "unavailable"
    ? { icon: "🛠️", title: "Coming soon", hint: "This part of the dashboard isn't connected yet." }
    : status === "error"
      ? { icon: "⚠️", title: "Couldn't load this", hint: "Something went wrong fetching this section." }
      : { icon, title: emptyTitle, hint: emptyHint };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 6, padding: "28px 12px", textAlign: "center",
    }}>
      <div style={{ fontSize: 26, opacity: 0.6 }}>{copy.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{copy.title}</div>
      {copy.hint && <div style={{ fontSize: 12, color: C.textSecondary, maxWidth: 260, lineHeight: 1.5 }}>{copy.hint}</div>}
    </div>
  );
}

// Small dismissible banner summarizing which sections couldn't load, with a
// one-click retry — shown above the dashboard during a partial outage.
function PartialOutageBanner({ C, missingLabels, onRetry, onDismiss }) {
  if (missingLabels.length === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      background: C.warningLight, border: `1px solid ${C.warning}40`, borderRadius: 12,
      padding: "10px 16px", fontSize: 12.5, color: C.text,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15 }}>⚠️</span>
        <span>
          <strong>{missingLabels.length === 1 ? "One section" : `${missingLabels.length} sections`}</strong>{" "}
          couldn't load right now ({missingLabels.join(", ")}). The rest of your dashboard is up to date.
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={onRetry} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.warning, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
        <button onClick={onDismiss} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "transparent", color: C.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATED DASHBOARD (with simulated data fetching)
// ═════════════════════════════════════════════════════════════════════════════
function DashboardView({ C }) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [greeting, setGreeting] = useState("Good morning");

  // Data states — arrays/objects default to empty rather than null so a
  // failed or not-yet-implemented endpoint degrades to "nothing here yet"
  // instead of crashing a .map()/.filter() call downstream.
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [resources, setResources] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  // Per-section fetch status: "unavailable" (404 — endpoint not wired up yet),
  // "error" (network/5xx/etc), or absent (loaded fine).
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch all dashboard data from real backend. Each section is fetched
  // independently — one missing/broken endpoint never blocks the rest of
  // the dashboard from rendering.
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
          if (mounted) setter(data ?? []);
        })
      );

      if (!mounted) return;

      const nextErrors = {};
      results.forEach((result, i) => {
        if (result.status !== "rejected") return;
        const [key] = calls[i];
        const status = result.reason?.response?.status;
        if (status === 404) {
          // Endpoint isn't implemented on the backend yet — this is an
          // expected, recoverable state during development, not a bug to
          // surface as a scary stack trace. Log once, quietly.
          nextErrors[key] = "unavailable";
          console.warn(`Dashboard: "${key}" endpoint not found (404) — showing fallback UI for that section.`);
        } else {
          nextErrors[key] = "error";
          console.error(`Dashboard: failed to load "${key}"`, result.reason);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} C={C} height={120} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonCard C={C} height={200} />
            <SkeletonCard C={C} height={200} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonCard C={C} height={250} />
            <SkeletonCard C={C} height={200} />
          </div>
        </div>
      </div>
    );
  }

  // Full outage: every single section failed (e.g. wrong API base URL, backend
  // down, or none of the routes exist yet). In that case there's nothing
  // meaningful to render, so show one clear, actionable screen instead of a
  // dashboard full of empty boxes.
  const sectionKeys = ["user", "stats", "questions", "studyGroups", "notifications", "leaderboard", "resources", "activity"];
  const failedCount = sectionKeys.filter(k => errors[k]).length;
  const allFailed = failedCount === sectionKeys.length;

  if (allFailed) {
    const anyUnavailable = sectionKeys.some(k => errors[k] === "unavailable");
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16, background: C.surfaceElevated, borderRadius: 16, border: `1px solid ${C.border}`,
        minHeight: 500, boxShadow: C.cardShadow, padding: 40,
      }}>
        <div style={{ fontSize: 64 }}>📊</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
          {anyUnavailable ? "Setting up your profile space" : "We're having trouble connecting"}
        </div>
        <div style={{ fontSize: 14, color: C.textSecondary, textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
          {anyUnavailable
            ? "Welcome to the dashboard! These endpoints aren't wired up on the backend yet — once they are, your data will show up here automatically."
            : "We couldn't reach the server just now. Check your connection and try again."}
        </div>
        <button
          onClick={retry}
          style={{
            marginTop: 4, padding: "10px 20px", borderRadius: 10, border: "none",
            background: C.primary, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  // Partial outage: render the dashboard with whatever data did load, and
  // show a small dismissible banner calling out what's temporarily missing.
  const safeUser = user ?? {
    name: "there", initials: "?", streak: 0, role: "Member",
    points: 0, questionsAsked: 0, answersGiven: 0, resourcesShared: 0, rank: "—",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PartialOutageBanner
        C={C}
        missingLabels={missingLabels}
        onRetry={retry}
        onDismiss={() => setBannerDismissed(true)}
      />
      {/* Welcome Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(135deg, ${C.surfaceElevated} 0%, ${C.primaryLight} 100%)`,
        border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px",
        position: "relative", overflow: "hidden", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.primary}12, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            {greeting}, {safeUser?.first_name + "    " + safeUser?.last_name}
          </div>
          <div style={{ fontSize: 13, color: C.textSecondary }}>Here's what's happening in your learning community today.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", width: 220, boxShadow: C.cardShadow }}>
            <span style={{ fontSize: 14, color: C.textSecondary }}>🔍</span>
            <input
              type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: C.text, width: "100%", fontFamily: "inherit" }}
            />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `linear-gradient(90deg, ${C.primary}, #7C3AED)`,
            color: "#fff", borderRadius: 99, padding: "7px 16px",
            fontSize: 13, fontWeight: 600,
            boxShadow: `0 4px 12px ${C.primary}40`,
            animation: "pulse 2s infinite",
          }}>
            <span style={{ fontSize: 15 }}>🔥</span>{safeUser.streak}-day streak
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: C.surfaceElevated, border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 18, transition: "all 0.2s ease",
                boxShadow: C.cardShadow, color: C.text,
              }}
            >🔔</button>
            {unreadCount > 0 && (
              <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: C.danger, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.surfaceElevated}` }}>
                {unreadCount}
              </div>
            )}
            {notifOpen && (
              <div style={{ position: "absolute", top: 50, right: 0, width: 320, background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", zIndex: 100, padding: "16px", animation: "slideDown 0.2s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Notifications</div>
                  <button onClick={markAllRead} style={{ fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                  {notifications.length > 0
                    ? notifications.map(n => <NotifItem key={n.id} n={n} onRead={markAsRead} C={C} />)
                    : <SectionEmptyState C={C} status={errors.notifications} icon="🔔" emptyTitle="No notifications" emptyHint="You're all caught up." />}
                </div>
              </div>
            )}
          </div>

          <Avatar initials={safeUser.initials} color={C.accent} size={40} ring C={C} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.length > 0
          ? stats.map((s, i) => <StatCard key={i} stat={s} C={C} />)
          : <SectionEmptyState C={C} status={errors.stats} icon="📈" emptyTitle="No stats yet" emptyHint="Stats will appear once there's activity to measure." />}
      </div>

      {/* Personal stats bar */}
      <div style={{
        background: `linear-gradient(135deg, ${C.surfaceElevated}, ${C.primaryLight})`,
        border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 22px",
        display: "flex", alignItems: "center", gap: 0,
        boxShadow: C.cardShadow, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <Avatar initials={safeUser.initials} color={C.accent} size={42} ring C={C} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{safeUser.name}</div>
            <div style={{ fontSize: 12, color: C.textSecondary }}>{safeUser.role} · Joined Jan 2025</div>
          </div>
        </div>
        {[
          { label: "Points", value: safeUser.points, color: C.primary },
          { label: "Questions", value: safeUser.questionsAsked, color: C.accent },
          { label: "Answers", value: safeUser.answersGiven, color: C.success },
          { label: "Resources", value: safeUser.resourcesShared, color: C.warning },
          { label: "Rank", value: `#${safeUser.rank}`, color: C.danger },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", borderLeft: `1px solid ${C.border}`, padding: "0 20px", minWidth: 80 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", paddingLeft: 20, borderLeft: `1px solid ${C.border}` }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10, background: C.primary,
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>View profile →</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* Recent Questions */}
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Recent Questions</div>
                <div style={{ fontSize: 12, color: C.textSecondary }}>Latest discussions from your community</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "open", "resolved"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: "5px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: activeTab === tab ? C.primary : C.surface,
                    color: activeTab === tab ? "#fff" : C.textSecondary,
                  }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredQuestions.length > 0
                ? filteredQuestions.map(q => <QuestionCard key={q.id} q={q} C={C} />)
                : <SectionEmptyState C={C} status={errors.questions} icon="💬" emptyTitle="No questions yet" emptyHint="Be the first to start a discussion." />}
            </div>
            <button style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 10, border: `1px dashed ${C.border}`, background: C.surface, color: C.primary, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease" }}>
              View all questions →
            </button>
          </div>

          {/* Study Groups */}
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Study Groups</div>
                <div style={{ fontSize: 12, color: C.textSecondary }}>Collaborate with peers in real-time</div>
              </div>
              <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span>+</span> Create Group
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              {studyGroups.length > 0
                ? studyGroups.map(g => <StudyGroupCard key={g.id} group={g} C={C} />)
                : <SectionEmptyState C={C} status={errors.studyGroups} icon="👥" emptyTitle="No study groups yet" emptyHint="Create one to start collaborating with peers." />}
            </div>
          </div>

          {/* Resources */}
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Top Resources</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>Community-curated learning materials</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resources.length > 0
                ? resources.map(r => <ResourceCard key={r.id} r={r} C={C} />)
                : <SectionEmptyState C={C} status={errors.resources} icon="📚" emptyTitle="No resources yet" emptyHint="Shared resources will show up here." />}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0, maxWidth: 400 }}>
          {/* Leaderboard */}
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>🏆 Leaderboard</div>
                <div style={{ fontSize: 12, color: C.textSecondary }}>Top performers this week</div>
              </div>
              <Badge label="Weekly" bg={C.warningLight} color={C.warning} C={C} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {leaderboard.length > 0
                ? leaderboard.map(p => <LeaderboardRow key={p.rank} p={p} C={C} />)
                : <SectionEmptyState C={C} status={errors.leaderboard} icon="🏆" emptyTitle="No rankings yet" emptyHint="Rankings update weekly as the community gets active." />}
            </div>
            <button style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 10, border: "none", background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
              View full leaderboard →
            </button>
          </div>

          {/* Activity Feed */}
          <div style={{ background: C.surfaceElevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", boxShadow: C.cardShadow }}>
            <div style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>⚡ Live Activity</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>What's happening right now</div>
            </div>
            <div>
              {activity.length > 0
                ? activity.map(a => <ActivityItem key={a.id} activity={a} C={C} />)
                : <SectionEmptyState C={C} status={errors.activity} icon="⚡" emptyTitle="No recent activity" emptyHint="Live activity will appear here as it happens." />}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: C.gradientHero, borderRadius: 16, padding: "20px", color: "#fff" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Quick Actions</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>Get things done faster</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "💬", label: "Ask a question", desc: "Get help from the community", path: "/forum/ask" },
                { icon: "👥", label: "Join a study group", desc: "Collaborate with peers", path: "/groups" },
                { icon: "📚", label: "Share a resource", desc: "Contribute to the library", path: "/resources" },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 10, background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                  cursor: "pointer", transition: "all 0.2s ease", textAlign: "left", width: "100%",
                }}>
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{action.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{action.desc}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 14, opacity: 0.6 }}>→</span>
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
function PlaceholderView({ label, icon, C, hint }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: C.surfaceElevated, borderRadius: 16, border: `1px solid ${C.border}`, minHeight: 500, boxShadow: C.cardShadow }}>
      <div style={{ fontSize: 64, filter: "grayscale(0.3)", opacity: 0.8 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{label}</div>
      <div style={{ fontSize: 14, color: C.textSecondary, textAlign: "center", maxWidth: 300 }}>
        {hint || "This section is coming soon. We're working hard to bring you an amazing experience."}
      </div>
    </div>
  );
}

// ─── Forum sub-router ─────────────────────────────────────────────────────────
// QuestionFeed owns its own layout/theme (forumTheme.css), so it doesn't take C.
function ForumSection({ C }) {
  return <QuestionFeed />;
}

// ─── Resources section wrapper ────────────────────────────────────────────────
function ResourcesSection({ C }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ResourceList onAdd={() => setShowForm(true)} />
      {showForm && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24, width: "100%",
            maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          }}>
            {/* NOTE: prop names below (onClose/onSuccess) are a best guess —
               confirm they match your actual ResourceForm implementation. */}
            <ResourceForm
              onClose={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Gamification section ─────────────────────────────────────────────────────
function GamificationSection({ C }) {
  return <GamificationDashboard />;
}

// ─── Profile section ───────────────────────────────────────────────────────────
function ProfileSection({ C }) {
  return <ProfilePage C={C} />;
}

// ─── Study Groups section ───────────────────────────────────────────────────────
// GroupList owns its own layout/theme (styled-components), so it doesn't take C.
// onAdd/onView navigate to real routes, matching the convention QuestionFeed
// already uses (Link to "/forum/ask", "/forum/questions/:id") — confirm
// "/groups/new" and "/groups/:id" are mounted in your router.
function GroupsSection({ C }) {
  const navigate = useNavigate();
  return (
    <GroupList
      onAdd={() => navigate("/groups/new")}
      onView={(id) => navigate(`/groups/${id}`)}
    />
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function ActiveSection({ active, C }) {
  switch (active) {
    case "forum":        return <ForumSection C={C} />;
    case "resources":    return <ResourcesSection C={C} />;
    case "gamification": return <GamificationSection C={C} />;
    case "profile":      return <ProfileSection C={C} />;
    case "groups":       return <GroupsSection C={C} />;
    default:             return null;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function MainDashboard() {
  const { C, themeMode, toggleTheme } = useTheme();
  const [active, setActive] = useLocalStorage('educonnect-active-tab', 'dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

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
    setActive('dashboard');
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: C.bg,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      width: "100%",
    }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.scrollbarThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.scrollbarThumbHover}; }
      `}</style>

      <Sidebar
        active={active}
        onNav={handleNav}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        C={C}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main style={{
        flex: 1,
        padding: isMobile ? "16px" : "28px 32px",
        overflowY: "auto",
        minHeight: "100vh",
        animation: "fadeIn 0.4s ease",
        position: "relative",
      }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, padding: "12px 16px", background: C.surfaceElevated,
            borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.cardShadow,
          }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "none", border: "none", fontSize: 24, cursor: "pointer",
                color: C.text, padding: 4,
              }}
            >☰</button>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>EduConnect</div>
            <div style={{ width: 32 }} />
          </div>
        )}

        {active === "dashboard"
          ? (isLoggedIn
              ? <DashboardView C={C} />
              : <GuestPromoPanel
                  C={C}
                />
            )
          : ["forum", "resources", "gamification", "profile", "groups"].includes(active)
            ? <ActiveSection active={active} C={C} />
            : <PlaceholderView
                label={NAV_ITEMS.find(n => n.key === active)?.label ?? active}
                icon={NAV_ITEMS.find(n => n.key === active)?.icon ?? "🔒"}
                C={C}
              />
        }
      </main>
    </div>
  );
}