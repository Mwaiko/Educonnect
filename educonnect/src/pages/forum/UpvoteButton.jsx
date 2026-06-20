import { useState } from "react";
import "./forumTheme.css";

/**
 * Upvote Interface — a vertical vote stamp used on both questions
 * and answers.
 *
 * Frontend Task: "Upvote Interface" (Mwai Komo, Module 2: Forum & Q&A).
 *
 * Props:
 *   count     - current upvote_count
 *   onToggle  - async fn, called on click; should call
 *               POST /forum/questions/{id}/upvote/ or
 *               POST /forum/answers/{id}/upvote/ and resolve
 *               with { upvote_count, user_has_upvoted }
 *   hasUpvoted - optional initial vote state (from user_has_upvoted)
 *   size       - "sm" | "md" (default "md")
 */
export default function UpvoteButton({ count, onToggle, hasUpvoted = false, size = "md" }) {
  const [active, setActive] = useState(hasUpvoted);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    // Optimistic toggle
    setActive((prev) => !prev);
    try {
      const result = await onToggle();
      if (result && typeof result.user_has_upvoted === "boolean") {
        setActive(result.user_has_upvoted);
      }
    } catch (err) {
      // revert on failure
      setActive((prev) => !prev);
    } finally {
      setBusy(false);
    }
  };

  const dims = size === "sm" ? { btn: 28, font: 13 } : { btn: 36, font: 15 };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remove upvote" : "Upvote"}
      className="forum-mono"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        width: dims.btn,
        minHeight: dims.btn + 18,
        padding: "6px 4px",
        border: `1px solid ${active ? "var(--eq-accent)" : "var(--eq-rule)"}`,
        borderRadius: 6,
        background: active ? "var(--eq-accent-soft)" : "var(--eq-paper)",
        color: active ? "var(--eq-accent)" : "var(--eq-graphite)",
        cursor: busy ? "wait" : "pointer",
        transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
        flexShrink: 0,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ transform: active ? "translateY(-1px)" : "none" }}
      >
        <path d="M7 1L13 9H1L7 1Z" fill="currentColor" />
      </svg>
      <span style={{ fontSize: dims.font, fontWeight: 600, lineHeight: 1 }}>{count}</span>
    </button>
  );
}
