/* ============================================================
   UserProfilePage.jsx – EduConnect Public Profile
   Route: /profile  |  /profile/:userId
   API: GET /api/v1/users/profile/
        GET /api/v1/users/:id/  (public profiles)
   ============================================================ */
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./ProfilePages.css";

/* ── Placeholder data (replace with API response) ── */
const MOCK_USER = {
  id: 1,
  first_name: "Mwai",
  last_name:  "Komo",
  email:      "mwai@university.ac.ke",
  role:       "student",
  bio:        "3rd year CS student passionate about algorithms and distributed systems. I help others debug tricky graph problems.",
  subjects:   ["Algorithms", "Data Structures", "Networks", "Mathematics"],
  streak_count: 12,
  points_total: 460,
  rank_position: 3,
  questions_asked: 28,
  answers_given:   47,
  resources_shared: 9,
  joined_date: "January 2025",
  initials:   "MK",
};

const MOCK_RECENT = [
  { id: 1, type: "question", title: "How does Dijkstra's algorithm handle negative weights?",  tags: ["Algorithms","Graphs"],    answers: 3, upvotes: 11, date: "2 days ago" },
  { id: 2, type: "answer",   title: "Re: What is the time complexity of merge sort?",          tags: ["Algorithms"],             accepted: true, upvotes: 8, date: "4 days ago" },
  { id: 3, type: "resource", title: "Introduction to Algorithms (CLRS) – 4th Edition",         tags: ["Algorithms","Mathematics"], votes: 14, date: "1 week ago" },
];

export default function UserProfilePage() {
  const [user, setUser]         = useState(MOCK_USER);
  const [activity, setActivity] = useState(MOCK_RECENT);
  const [loading, setLoading]   = useState(false);
  const isOwnProfile            = true; // determine from auth context

  useEffect(() => {
    // Swap mock data with real API call:
    // setLoading(true);
    // fetch("/api/v1/users/profile/", {
    //   headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    // })
    // .then(r => r.json()).then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ec-page-loader"><span className="ec-spinner ec-spinner--lg" /></div>;

  return (
    <>
      <Navbar user={user} activePage="profile" />

      <main className="ec-page">
        <div className="ec-page-inner profile-layout">

          {/* ── Left column: profile card ── */}
          <aside className="profile-sidebar">
            <div className="ec-card profile-card">
              {/* Cover gradient */}
              <div className="profile-cover" />

              {/* Avatar */}
              <div className="profile-avatar-wrap">
                <div className="avatar av-indigo profile-avatar">{user.initials}</div>
                {user.streak_count > 0 && (
                  <span className="streak-pill profile-streak">🔥 {user.streak_count}-day streak</span>
                )}
              </div>

              <div className="profile-info">
                <h1 className="profile-name">{user.first_name} {user.last_name}</h1>
                <div className="profile-meta-row">
                  <span className={`badge ${user.role === "expert_solver" ? "badge-cyan" : "badge-indigo"}`}>
                    {user.role === "expert_solver" ? "Expert Solver" : "Student"}
                  </span>
                  <span className="badge badge-gray">#{user.rank_position} this week</span>
                </div>
                <p className="profile-bio">{user.bio}</p>

                <div className="profile-detail">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {user.email}
                </div>
                <div className="profile-detail">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Joined {user.joined_date}
                </div>

                {isOwnProfile && (
                  <a href="/profile/edit" className="btn btn-secondary btn-full" style={{ marginTop: 16 }}>
                    Edit profile
                  </a>
                )}
              </div>
            </div>

            {/* Subjects */}
            <div className="ec-card" style={{ marginTop: 12 }}>
              <h3 className="profile-section-label">Subject interests</h3>
              <div className="profile-subjects">
                {user.subjects.map((s) => (
                  <span key={s} className="badge badge-indigo">{s}</span>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Right column: stats + activity ── */}
          <div className="profile-main">

            {/* Stats row */}
            <div className="profile-stats-grid">
              {[
                { value: user.points_total,     label: "Total points",    color: "var(--ec-primary)" },
                { value: user.questions_asked,   label: "Questions asked", color: "var(--ec-accent)" },
                { value: user.answers_given,     label: "Answers given",   color: "var(--ec-success)" },
                { value: user.resources_shared,  label: "Resources shared",color: "var(--ec-warning)" },
              ].map((s) => (
                <div className="ec-card ec-card-accent profile-stat-card" key={s.label} style={{ borderTopColor: s.color }}>
                  <span className="profile-stat-value" style={{ color: s.color }}>{s.value}</span>
                  <span className="profile-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="ec-card" style={{ marginTop: 16 }}>
              <h2 className="profile-section-title">Recent activity</h2>
              <div className="profile-activity-list">
                {activity.map((item) => (
                  <div className="profile-activity-item" key={item.id}>
                    <div className={`profile-activity-icon ${item.type}`}>
                      {item.type === "question" && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      )}
                      {item.type === "answer" && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      )}
                      {item.type === "resource" && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      )}
                    </div>
                    <div className="profile-activity-body">
                      <a href={`/${item.type}s/${item.id}`} className="profile-activity-title">
                        {item.title}
                      </a>
                      <div className="profile-activity-meta">
                        {item.tags.map((t) => (
                          <span key={t} className="badge badge-gray" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                        {item.accepted && <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Accepted</span>}
                        <span className="profile-activity-date">{item.date}</span>
                      </div>
                    </div>
                    <div className="profile-activity-score">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                      {item.upvotes || item.votes || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
