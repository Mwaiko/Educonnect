import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import forumApi from "../../api/forumApi";
import { getTags } from "../../api/tags";
import UpvoteButton from "./UpvoteButton";

// ─── Theme System (shared with GamificationDashboard) ─────────────────────────
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
    cardShadow: "0 1px 3px rgba(0,0,0,0.04)",
    hoverShadow: "0 12px 24px rgba(79,70,229,0.15), 0 4px 8px rgba(0,0,0,0.04)",
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
    cardShadow: "0 1px 3px rgba(0,0,0,0.3)",
    hoverShadow: "0 12px 24px rgba(129,140,248,0.15), 0 4px 8px rgba(0,0,0,0.2)",
    inputBg: "#1E1B4B",
    scrollbarThumb: "rgba(129,140,248,0.3)",
    scrollbarThumbHover: "rgba(129,140,248,0.5)",
    gradientHero: "linear-gradient(135deg, #1a1647 0%, #0F0A3C 100%)",
  }
};

function useTheme(initialMode) {
  const [mode, setMode] = useState(() => {
    // 1. Prioritize explicitly passed props from the parent
    if (initialMode === "light" || initialMode === "dark") return initialMode;
    
    // 2. Fall back to localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("educonnect-theme") || "light";
    }
    return "light";
  });

  // Keep internal state in sync if the parent prop changes dynamically
  useEffect(() => {
    if (initialMode === "light" || initialMode === "dark") {
      setMode(initialMode);
    }
  }, [initialMode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("educonnect-theme", next);
      return next;
    });
  }, []);

  // Safety fallback: Ensure t is never undefined even if mode state is temporarily quirky
  const t = THEMES[mode] || THEMES.light; 
  
  return { mode, toggle, t };
}
// ─── Sub-components ─────────────────────────────────────────────────────────

function ThemeToggle({ mode, onToggle, t }) {
  return (
    <button
      className="qf-theme-toggle"
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

function QuestionSkeleton({ t }) {
  return (
    <div className="qf-skeleton-card">
      <div className="qf-skeleton-upvote" />
      <div className="qf-skeleton-body">
        <div className="qf-skeleton-title" />
        <div className="qf-skeleton-line" />
        <div className="qf-skeleton-line short" />
        <div className="qf-skeleton-tags" />
      </div>
    </div>
  );
}

function QuestionCard({ q, onTagClick, onUpvoteChange, t }) {
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const res = await forumApi.toggleQuestionUpvote(q.id);
      onUpvoteChange(q.id, res);
    } catch (err) {
      console.error("Upvote failed:", err);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <li className="qf-card">
      <div className="qf-card-upvote">
        <UpvoteButton
          count={q.upvote_count}
          onToggle={handleUpvote}
          disabled={upvoting}
        />
      </div>
      {/* Wrapping Link makes the whole card body navigable; tag buttons
          stop propagation so clicking a tag only filters, not navigates. */}
      <Link to={`/forum/questions/${q.id}`} className="qf-card-body qf-card-link">
        <div className="qf-card-header-row">
          <span className="qf-card-title">
            {q.title}
          </span>
          {q.is_resolved && (
            <span className="qf-resolved-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Resolved
            </span>
          )}
        </div>
        <p className="qf-card-excerpt">{q.body}</p>
        <div className="qf-card-meta">
          <div className="qf-card-tags">
            {q.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick(tag.slug); }}
                className="qf-tag"
                title={tag.breadcrumb}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="qf-card-author">
            <span className="qf-avatar">
              {q.author.username?.slice(0, 2).toUpperCase() || "??"}
            </span>
            <span className="qf-author-name">{q.author.username}</span>
            <span className="qf-dot">·</span>
            <span className="qf-answers-count">
              {q.answer_count} {q.answer_count === 1 ? "answer" : "answers"}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function FilterBar({
  search, setSearch, tag, setTag, ordering, setOrdering,
  isResolved, setIsResolved, onSearchSubmit, t, availableTags, tagsLoading
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="qf-filter-bar">
      <div className="qf-filter-main">
        <div className="qf-search-wrap">
          <svg className="qf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit(e)}
            placeholder="Search questions…"
            aria-label="Search questions"
            className="qf-input qf-input-search"
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`qf-filter-toggle ${expanded ? "active" : ""}`}
          aria-expanded={expanded}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
        </button>
      </div>

      <div className={`qf-filter-drawer ${expanded ? "open" : ""}`}>
        <div className="qf-filter-row">
          <div className="qf-filter-group">
            <label className="qf-filter-label">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              aria-label="Filter by tag"
              className="qf-select"
              disabled={tagsLoading}
            >
              <option value="">{tagsLoading ? "Loading tags…" : "All tags"}</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="qf-filter-group">
            <label className="qf-filter-label">Sort by</label>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              aria-label="Sort order"
              className="qf-select"
            >
              <option value="-created_at">Newest</option>
              <option value="-upvote_count">Most upvoted</option>
              <option value="created_at">Oldest</option>
            </select>
          </div>
          <div className="qf-filter-group">
            <label className="qf-filter-label">Status</label>
            <select
              value={isResolved}
              onChange={(e) => setIsResolved(e.target.value)}
              aria-label="Filter by resolution status"
              className="qf-select"
            >
              <option value="">All questions</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onSearchSubmit}
            className="qf-btn qf-btn-primary"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange, t }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="qf-pagination" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="qf-page-btn"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {getPageNumbers().map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`qf-page-btn ${p === page ? "active" : ""}`}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="qf-page-btn"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "-upvote_count", label: "Most upvoted" },
];

export default function QuestionFeed({ themeMode, onToggleTheme } = {}) {
  const { mode, toggle, t } = useTheme(themeMode, onToggleTheme);
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [isResolved, setIsResolved] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTagsLoading(true);
    getTags({ level: "tag" })
      .then((res) => setAvailableTags(res.data?.results ?? res.data ?? []))
      .catch(() => {})
      .finally(() => setTagsLoading(false));
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, ordering };
      if (search.trim()) params.search = search.trim();
      if (tag.trim()) params.tag = tag.trim();
      if (isResolved !== "") params.is_resolved = isResolved;

      const data = await forumApi.listQuestions(params);
      setQuestions(data.results);
      setCount(data.count);
    } catch (err) {
      setError("Couldn't load the question feed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, tag, ordering, isResolved]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleUpvoteChange = (questionId, { upvote_count }) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, upvote_count } : q))
    );
  };

  const handleTagClick = (tagName) => {
    setTag(tagName);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <>
      <style>{getStyles(t, mode)}</style>
      <div className={`qf-root ${mounted ? "mounted" : ""}`} data-theme={mode}>
        {/* Header */}
        <header className="qf-header">
          <div className="qf-header-inner">
            <div className="qf-header-brand">
              <div className="qf-brand-logo">
                <div className="qf-brand-logo-inner">
                  <div className="qf-brand-logo-dot" />
                </div>
              </div>
              <div>
                <h1 className="qf-header-title">Question Feed</h1>
                <p className="qf-header-subtitle">
                  Browse what your peers are stuck on — or post your own.
                </p>
              </div>
            </div>
            <div className="qf-header-actions">
              <Link to="/forum/ask" className="qf-btn qf-btn-ask">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ask a question
              </Link>
              <ThemeToggle mode={mode} onToggle={toggle} t={t} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="qf-main">
          {/* Stats bar */}
          <div className="qf-stats-bar">
            <div className="qf-stat">
              <span className="qf-stat-value">{count.toLocaleString()}</span>
              <span className="qf-stat-label">questions</span>
            </div>
            {tag && (
              <div className="qf-active-filter">
                <span>Tag: <strong>{availableTags.find((t) => t.slug === tag)?.name || tag}</strong></span>
                <button onClick={() => { setTag(""); setPage(1); }} aria-label="Clear tag filter">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            {search && (
              <div className="qf-active-filter">
                <span>Search: <strong>{search}</strong></span>
                <button onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear search filter">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <FilterBar
            search={search}
            setSearch={setSearch}
            tag={tag}
            setTag={setTag}
            ordering={ordering}
            setOrdering={setOrdering}
            isResolved={isResolved}
            setIsResolved={setIsResolved}
            onSearchSubmit={handleSearchSubmit}
            t={t}
            availableTags={availableTags}
            tagsLoading={tagsLoading}
          />

          {/* Error */}
          {error && (
            <div className="qf-error-banner" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
              <button onClick={fetchQuestions} className="qf-btn qf-btn-sm">Retry</button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="qf-list">
              {[1, 2, 3, 4, 5].map((i) => (
                <QuestionSkeleton key={i} t={t} />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="qf-empty-state">
              <div className="qf-empty-icon">🔍</div>
              <h3>No questions match</h3>
              <p>Try adjusting your filters or be the first to ask a question.</p>
              <Link to="/forum/ask" className="qf-btn qf-btn-primary">
                Ask a question
              </Link>
            </div>
          ) : (
            <>
              <ul className="qf-list">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    onTagClick={handleTagClick}
                    onUpvoteChange={handleUpvoteChange}
                    t={t}
                  />
                ))}
              </ul>

              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  t={t}
                />
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ─── Dynamic Styles ───────────────────────────────────────────────────────────

function getStyles(t, mode) {
  const isDark = mode === "dark";
  return `
    /* ─── Base ─── */
    .qf-root[data-theme="${mode}"] {
      min-height: 100vh;
      background: ${t.bg};
      color: ${t.text};
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.4s ease, transform 0.4s ease, background 0.3s ease, color 0.3s ease;
    }
    .qf-root[data-theme="${mode}"].mounted {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Header ─── */
    .qf-header {
      background: ${t.gradientHero};
      padding: 2rem 1.5rem 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .qf-header::before {
      content: "";
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,${isDark ? "0.03" : "0.06"}) 0%, transparent 70%);
      pointer-events: none;
    }
    .qf-header-inner {
      max-width: 840px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }
    .qf-header-brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .qf-brand-logo {
      width: 40px;
      height: 40px;
      background: ${t.white};
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,${isDark ? "0.3" : "0.15"});
      transition: background 0.3s ease;
    }
    .qf-brand-logo-inner {
      width: 24px;
      height: 24px;
      background: ${isDark ? "#818CF8" : "#4F46E5"};
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }
    .qf-brand-logo-dot {
      width: 7px;
      height: 7px;
      background: ${t.white};
      border-radius: 50%;
      transition: background 0.3s ease;
    }
    .qf-header-title {
      font-size: 1.4rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: ${isDark ? "#F1F5F9" : "#FFFFFF"};
      margin: 0;
      transition: color 0.3s ease;
    }
    .qf-header-subtitle {
      font-size: 0.82rem;
      color: ${isDark ? "rgba(241,245,249,0.55)" : "rgba(255,255,255,0.7)"};
      margin: 0.15rem 0 0;
      transition: color 0.3s ease;
    }
    .qf-header-actions {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    /* ─── Theme Toggle ─── */
    .qf-theme-toggle {
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
    .qf-theme-toggle:hover {
      transform: scale(1.08);
      box-shadow: ${t.cardShadow};
    }

    /* ─── Buttons ─── */
    .qf-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      font-family: inherit;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .qf-btn:hover { opacity: 0.88; transform: translateY(-1px); }
    .qf-btn-primary {
      background: ${t.primary};
      color: ${isDark ? "#0F172A" : "#FFFFFF"};
    }
    .qf-btn-ask {
      background: ${t.primary};
      color: ${isDark ? "#0F172A" : "#FFFFFF"};
      padding: 10px 18px;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .qf-btn-sm {
      padding: 6px 14px;
      font-size: 0.78rem;
    }

    /* ─── Main ─── */
    .qf-main {
      max-width: 840px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* ─── Stats Bar ─── */
    .qf-stats-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .qf-stat {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .qf-stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: ${t.primary};
      transition: color 0.3s ease;
    }
    .qf-stat-label {
      font-size: 0.75rem;
      color: ${t.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.06em;
      transition: color 0.3s ease;
    }
    .qf-active-filter {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: ${t.primaryLight};
      border: 0.5px solid ${t.border};
      border-radius: 99px;
      font-size: 0.72rem;
      color: ${t.primary};
      transition: all 0.3s ease;
    }
    .qf-active-filter button {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 0;
      display: flex;
      align-items: center;
      opacity: 0.7;
      transition: opacity 0.15s;
    }
    .qf-active-filter button:hover { opacity: 1; }

    /* ─── Filter Bar ─── */
    .qf-filter-bar {
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.25rem;
      box-shadow: ${t.cardShadow};
      transition: all 0.3s ease;
    }
    .qf-filter-main {
      display: flex;
      gap: 0.625rem;
      align-items: center;
    }
    .qf-search-wrap {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .qf-search-icon {
      position: absolute;
      left: 12px;
      color: ${t.textSecondary};
      pointer-events: none;
      transition: color 0.3s ease;
    }
    .qf-input {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid ${t.border};
      border-radius: 8px;
      background: ${t.inputBg};
      color: ${t.text};
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }
    .qf-input::placeholder { color: ${t.textSecondary}; opacity: 0.6; }
    .qf-input:focus {
      border-color: ${t.primary};
      box-shadow: 0 0 0 3px ${isDark ? "rgba(129,140,248,0.15)" : "rgba(79,70,229,0.12)"};
    }
    .qf-input-search {
      padding-left: 36px;
    }
    .qf-select {
      padding: 9px 28px 9px 12px;
      border: 1px solid ${t.border};
      border-radius: 8px;
      background: ${t.inputBg};
      color: ${t.text};
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? "%2394A3B8" : "%236B7280"}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      transition: all 0.2s ease;
    }
    .qf-select:focus {
      border-color: ${t.primary};
      box-shadow: 0 0 0 3px ${isDark ? "rgba(129,140,248,0.15)" : "rgba(79,70,229,0.12)"};
    }
    .qf-filter-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 14px;
      border: 1px solid ${t.border};
      border-radius: 8px;
      background: ${t.surface};
      color: ${t.textSecondary};
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .qf-filter-toggle:hover, .qf-filter-toggle.active {
      border-color: ${t.primary};
      color: ${t.primary};
      background: ${t.primaryLight};
    }
    .qf-filter-drawer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
      opacity: 0;
    }
    .qf-filter-drawer.open {
      max-height: 200px;
      opacity: 1;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 0.5px solid ${t.border};
    }
    .qf-filter-row {
      display: flex;
      gap: 0.625rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .qf-filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 140px;
    }
    .qf-filter-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: ${t.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.06em;
      transition: color 0.3s ease;
    }

    /* ─── Error Banner ─── */
    .qf-error-banner {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 1rem;
      background: ${t.dangerLight};
      border: 0.5px solid ${isDark ? "rgba(248,113,113,0.25)" : "rgba(239,68,68,0.2)"};
      border-radius: 10px;
      color: ${t.danger};
      font-size: 0.85rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .qf-error-banner .qf-btn-sm {
      margin-left: auto;
      background: ${t.danger};
      color: white;
    }

    /* ─── Question List ─── */
    .qf-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ─── Question Card ─── */
    .qf-card {
      display: flex;
      gap: 1rem;
      padding: 1.125rem 1.25rem;
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 12px;
      box-shadow: ${t.cardShadow};
      transition: all 0.2s ease;
      animation: qf-slide-up 0.35s ease forwards;
      opacity: 0;
      transform: translateY(8px);
    }
    .qf-card:hover {
      box-shadow: ${t.hoverShadow};
      transform: translateY(-2px);
      border-color: ${isDark ? "rgba(129,140,248,0.3)" : "rgba(79,70,229,0.22)"};
    }
    .qf-card-upvote {
      flex-shrink: 0;
      padding-top: 2px;
    }
    .qf-card-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .qf-card-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .qf-card-link:hover .qf-card-title {
      color: ${t.primary};
    }
    .qf-card-header-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .qf-card-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: ${t.text};
      text-decoration: none;
      line-height: 1.35;
      transition: color 0.15s ease;
      flex: 1;
    }
    .qf-card-title:hover {
      color: ${t.primary};
    }
    .qf-resolved-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      background: ${t.successLight};
      color: ${t.success};
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .qf-card-excerpt {
      margin: 0;
      color: ${t.textSecondary};
      font-size: 0.85rem;
      line-height: 1.55;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      transition: color 0.3s ease;
    }
    .qf-card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }
    .qf-card-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .qf-tag {
      padding: 3px 10px;
      background: ${t.primaryLight};
      color: ${t.primary};
      font-size: 0.72rem;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .qf-tag:hover {
      background: ${t.primary};
      color: ${isDark ? "#0F172A" : "#FFFFFF"};
      transform: translateY(-1px);
    }
    .qf-card-author {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: ${t.textSecondary};
      flex-shrink: 0;
      transition: color 0.3s ease;
    }
    .qf-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${isDark ? "#818CF8" : "#4F46E5"}, #7C3AED);
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qf-author-name { font-weight: 500; }
    .qf-dot { opacity: 0.4; }
    .qf-answers-count { white-space: nowrap; }

    /* ─── Skeleton ─── */
    .qf-skeleton-card {
      display: flex;
      gap: 1rem;
      padding: 1.125rem 1.25rem;
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 12px;
    }
    .qf-skeleton-upvote {
      width: 40px;
      height: 60px;
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
      border-radius: 8px;
      flex-shrink: 0;
      animation: qf-skeleton-pulse 1.5s ease-in-out infinite;
    }
    .qf-skeleton-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .qf-skeleton-title {
      height: 20px;
      width: 70%;
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
      border-radius: 6px;
      animation: qf-skeleton-pulse 1.5s ease-in-out infinite;
    }
    .qf-skeleton-line {
      height: 14px;
      width: 100%;
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
      border-radius: 4px;
      animation: qf-skeleton-pulse 1.5s ease-in-out infinite;
    }
    .qf-skeleton-line.short { width: 50%; }
    .qf-skeleton-tags {
      height: 22px;
      width: 120px;
      background: ${isDark ? "#2D2A5E" : "#F1F5F9"};
      border-radius: 6px;
      animation: qf-skeleton-pulse 1.5s ease-in-out infinite;
    }

    /* ─── Empty State ─── */
    .qf-empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      background: ${t.surfaceElevated};
      border: 0.5px dashed ${t.border};
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
    }
    .qf-empty-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }
    .qf-empty-state h3 {
      font-size: 1rem;
      font-weight: 600;
      color: ${t.text};
      margin: 0;
      transition: color 0.3s ease;
    }
    .qf-empty-state p {
      font-size: 0.82rem;
      color: ${t.textSecondary};
      margin: 0;
      max-width: 320px;
      line-height: 1.5;
      transition: color 0.3s ease;
    }

    /* ─── Pagination ─── */
    .qf-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      margin-top: 1.5rem;
      padding: 0.5rem;
      background: ${t.surfaceElevated};
      border: 0.5px solid ${t.border};
      border-radius: 10px;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      transition: all 0.3s ease;
    }
    .qf-page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: ${t.textSecondary};
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .qf-page-btn:hover:not(:disabled) {
      background: ${t.primaryLight};
      color: ${t.primary};
    }
    .qf-page-btn.active {
      background: ${t.primary};
      color: ${isDark ? "#0F172A" : "#FFFFFF"};
      font-weight: 600;
    }
    .qf-page-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }

    /* ─── Scrollbar ─── */
    .qf-list::-webkit-scrollbar,
    .qf-main::-webkit-scrollbar { width: 5px; }
    .qf-list::-webkit-scrollbar-track,
    .qf-main::-webkit-scrollbar-track { background: transparent; }
    .qf-list::-webkit-scrollbar-thumb,
    .qf-main::-webkit-scrollbar-thumb { background: ${t.scrollbarThumb}; border-radius: 4px; }
    .qf-list::-webkit-scrollbar-thumb:hover,
    .qf-main::-webkit-scrollbar-thumb:hover { background: ${t.scrollbarThumbHover}; }

    /* ─── Responsive ─── */
    @media (max-width: 640px) {
      .qf-header-inner { flex-direction: column; align-items: flex-start; }
      .qf-header-actions { width: 100%; justify-content: space-between; }
      .qf-filter-main { flex-wrap: wrap; }
      .qf-filter-row { flex-direction: column; }
      .qf-filter-group { width: 100%; }
      .qf-card { padding: 1rem; }
      .qf-card-meta { flex-direction: column; align-items: flex-start; }
      .qf-card-author { margin-top: 0.25rem; }
    }

    /* ─── Keyframes ─── */
    @keyframes qf-slide-up {
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes qf-skeleton-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
  `;
}