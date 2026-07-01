import { useState } from "react";

export default function UpvoteButton({ count, onToggle, hasUpvoted = false, size = "md" }) {
  const [active, setActive] = useState(hasUpvoted);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setActive((prev) => !prev);
    try {
      const result = await onToggle();
      if (result && typeof result.user_has_upvoted === "boolean") {
        setActive(result.user_has_upvoted);
      }
    } catch (err) {
      setActive((prev) => !prev);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remove upvote" : "Upvote"}
      disabled={busy}
      className={`forum-mono upvote-btn size-${size} ${active ? "active" : ""}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1L13 9H1L7 1Z" fill="currentColor" />
      </svg>
      <span>{count}</span>
    </button>
  );
}