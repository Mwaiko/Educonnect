import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import forumApi from "../../api/forumApi";
import UpvoteButton from "./UpvoteButton";
import "./forumTheme.css";

const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "-upvote_count", label: "Most upvoted" },
];

/**
 * Question Feed — the forum landing page.
 * Frontend Task: "Question Feed" (Mwai Komo, Module 2: Forum & Q&A).
 *
 * Talks to:
 *   GET  /api/v1/forum/questions/        (list, with tag/search/ordering)
 *   POST /api/v1/forum/questions/{id}/upvote/  (via UpvoteButton)
 */
export default function QuestionFeed() {
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [isResolved, setIsResolved] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    e.preventDefault();
    setPage(1);
  };

  const handleUpvoteChange = (questionId, { upvote_count }) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, upvote_count } : q))
    );
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="forum-root" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 className="forum-serif" style={{ fontSize: 32, margin: 0, fontWeight: 600 }}>
          Question Feed
        </h1>
        <p style={{ color: "var(--eq-graphite)", marginTop: 6 }}>
          Browse what your peers are stuck on — or post your own.
        </p>
      </header>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Link
          to="/forum/ask"
          className="forum-mono"
          style={{
            background: "var(--eq-accent)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Ask a question
        </Link>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
          padding: 12,
          background: "var(--eq-paper-raised)",
          border: "1px solid var(--eq-rule)",
          borderRadius: 8,
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          aria-label="Search questions"
          style={{
            flex: "2 1 200px",
            padding: "8px 10px",
            border: "1px solid var(--eq-rule)",
            borderRadius: 6,
            background: "var(--eq-paper)",
            color: "var(--eq-ink)",
          }}
        />
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Filter by tag (e.g. algorithms)"
          aria-label="Filter by tag"
          className="forum-mono"
          style={{
            flex: "1 1 160px",
            padding: "8px 10px",
            border: "1px solid var(--eq-rule)",
            borderRadius: 6,
            background: "var(--eq-paper)",
            color: "var(--eq-ink)",
            fontSize: 13,
          }}
        />
        <select
          value={ordering}
          onChange={(e) => {
            setOrdering(e.target.value);
            setPage(1);
          }}
          aria-label="Sort order"
          style={{
            padding: "8px 10px",
            border: "1px solid var(--eq-rule)",
            borderRadius: 6,
            background: "var(--eq-paper)",
            color: "var(--eq-ink)",
          }}
        >
          {ORDERING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={isResolved}
          onChange={(e) => {
            setIsResolved(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by resolution status"
          style={{
            padding: "8px 10px",
            border: "1px solid var(--eq-rule)",
            borderRadius: 6,
            background: "var(--eq-paper)",
            color: "var(--eq-ink)",
          }}
        >
          <option value="">All questions</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
        <button
          type="submit"
          className="forum-mono"
          style={{
            padding: "8px 16px",
            border: "1px solid var(--eq-ink)",
            borderRadius: 6,
            background: "var(--eq-ink)",
            color: "var(--eq-paper)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            border: "1px solid var(--eq-accent)",
            borderRadius: 6,
            color: "var(--eq-accent)",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="forum-mono" style={{ color: "var(--eq-graphite)" }}>
          Loading questions…
        </p>
      ) : questions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            border: "1px dashed var(--eq-rule)",
            borderRadius: 8,
            color: "var(--eq-graphite)",
          }}
        >
          <p style={{ fontSize: 16, marginBottom: 12 }}>No questions match yet.</p>
          <Link to="/forum/ask" style={{ color: "var(--eq-accent)", fontWeight: 600 }}>
            Be the first to ask one
          </Link>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {questions.map((q) => (
            <li
              key={q.id}
              style={{
                display: "flex",
                gap: 16,
                padding: 16,
                background: "var(--eq-paper-raised)",
                border: "1px solid var(--eq-rule)",
                borderRadius: 8,
              }}
            >
              <UpvoteButton
                count={q.upvote_count}
                onToggle={() =>
                  forumApi
                    .toggleQuestionUpvote(q.id)
                    .then((res) => handleUpvoteChange(q.id, res))
                }
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    to={`/forum/questions/${q.id}`}
                    className="forum-serif"
                    style={{
                      fontSize: 19,
                      fontWeight: 600,
                      color: "var(--eq-ink)",
                      textDecoration: "none",
                    }}
                  >
                    {q.title}
                  </Link>
                  {q.is_resolved && (
                    <span
                      className="forum-mono"
                      style={{
                        fontSize: 11,
                        color: "var(--eq-verify)",
                        background: "var(--eq-verify-soft)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      resolved
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: "6px 0 10px",
                    color: "var(--eq-graphite)",
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {q.body}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {q.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTag(t);
                        setPage(1);
                      }}
                      className="forum-mono"
                      style={{
                        fontSize: 11,
                        background: "var(--eq-tag-bg)",
                        border: "none",
                        borderRadius: 4,
                        padding: "3px 8px",
                        cursor: "pointer",
                        color: "var(--eq-ink)",
                      }}
                    >
                      #{t}
                    </button>
                  ))}
                  <span className="forum-mono" style={{ fontSize: 11, color: "var(--eq-graphite)" }}>
                    by {q.author.username} · {q.answer_count}{" "}
                    {q.answer_count === 1 ? "answer" : "answers"}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && questions.length > 0 && (
        <nav
          aria-label="Pagination"
          style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="forum-mono"
            style={paginationButtonStyle(page <= 1)}
          >
            ← Prev
          </button>
          <span className="forum-mono" style={{ alignSelf: "center", fontSize: 13, color: "var(--eq-graphite)" }}>
            page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="forum-mono"
            style={paginationButtonStyle(page >= totalPages)}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

function paginationButtonStyle(disabled) {
  return {
    padding: "6px 14px",
    border: "1px solid var(--eq-rule)",
    borderRadius: 6,
    background: disabled ? "var(--eq-paper)" : "var(--eq-paper-raised)",
    color: disabled ? "var(--eq-graphite)" : "var(--eq-ink)",
    fontSize: 13,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
