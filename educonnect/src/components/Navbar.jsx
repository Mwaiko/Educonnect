/* ============================================================
   Navbar.jsx – EduConnect top navigation bar
   Used on authenticated pages (Profile, Edit Profile)
   ============================================================ */
import { useState } from "react";
import "./Navbar.css";

export default function Navbar({ user, activePage = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="ec-navbar">
      <div className="ec-navbar-inner">
        {/* Brand */}
        <a href="/dashboard" className="ec-brand">
          <div className="ec-brand-logo">
            <div className="ec-brand-logo-inner">
              <div className="ec-brand-logo-dot" />
            </div>
          </div>
          <span className="ec-brand-name">EduConnect</span>
        </a>

        {/* Desktop links */}
        <div className="ec-nav-links">
          <a href="/forum"     className={`ec-nav-link ${activePage === "forum"     ? "active" : ""}`}>Forum</a>
          <a href="/resources" className={`ec-nav-link ${activePage === "resources" ? "active" : ""}`}>Resources</a>
          <a href="/groups"    className={`ec-nav-link ${activePage === "groups"    ? "active" : ""}`}>Study Groups</a>
        </div>

        {/* Right side */}
        <div className="ec-nav-right">
          <button className="ec-notif-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="ec-notif-dot" />
          </button>

          {/* Avatar dropdown */}
          <div className="ec-avatar-menu">
            <button
              className="ec-avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="avatar av-indigo">
                {user?.initials || "MK"}
              </div>
              <svg className="ec-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div className="ec-dropdown">
                <div className="ec-dropdown-header">
                  <span className="ec-dropdown-name">{user?.name || "Mwai Komo"}</span>
                  <span className="ec-dropdown-email">{user?.email || "mwai@university.ac.ke"}</span>
                </div>
                <hr className="ec-dropdown-divider" />
                <a href="/profile"      className="ec-dropdown-item">My Profile</a>
                <a href="/profile/edit" className="ec-dropdown-item">Edit Profile</a>
                <hr className="ec-dropdown-divider" />
                <a href="/login" className="ec-dropdown-item ec-dropdown-item--danger">Sign Out</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
