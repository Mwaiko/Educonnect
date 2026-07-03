import { useState, useRef, useEffect } from "react";
import forumApi from "../../api/forumApi";
import SuggestResourcePanel from "./SuggestResourcePanel";
import "./forumTheme.css";

/**
 * Answer Submission Form — EduConnect Design System Implementation
 * Styling lives entirely in forumTheme.css (see .ans-* classes), plus
 * answerResources.css for the "suggest a resource" panel (.ares-* classes).
 */

/* ── SVG Icons (inline, no deps) ──────────────────────────────────── */
function IconSend({ size = 16, className = "icon-white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconAlert({ size = 16, className = "icon-danger" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconClose({ size = 14, className = "icon-muted" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck({ size = 16, className = "icon-success" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSparkle({ size = 18, className = "icon-primary" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  );
}

/* ── Character Counter ────────────────────────────────────────────── */
function CharacterCounter({ current, max }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = current > max * 0.85;
  const isOverLimit = current > max;
  const state = isOverLimit ? "over-limit" : isNearLimit ? "near-limit" : "normal";

  return (
    <div className={`ans-char-counter ${state}`}>
      <div className="ans-char-bar">
        <div
          className={`ans-char-bar-fill ${state}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>
        {current}/{max}
      </span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */
export default function AnswerSubmissionForm({ questionId, onPosted }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [stagedResources, setStagedResources] = useState([]);
  const [resourceWarning, setResourceWarning] = useState(null);
  const textareaRef = useRef(null);
  const MAX_CHARS = 2000;

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();

    if (!trimmed) {
      setError("Write an answer before submitting.");
      textareaRef.current?.focus();
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Your answer is too long. Maximum ${MAX_CHARS} characters allowed.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setResourceWarning(null);

    try {
      const answer = await forumApi.postAnswer(questionId, { body: trimmed });

      // Resources can only be linked once the answer exists. Attach each
      // staged item now; a resource failing to attach shouldn't undo the
      // answer post itself, so failures are surfaced as a soft warning
      // rather than a blocking error.
      let suggestedResources = [];
      if (stagedResources.length > 0) {
        const outcomes = await Promise.allSettled(
          stagedResources.map((item) =>
            forumApi.suggestAnswerResource(
              answer.id,
              item.mode === "existing"
                ? { resource_id: item.resource.id }
                : {
                    title: item.title,
                    url: item.url,
                    resource_type: item.resource_type || undefined,
                    tag_id: item.tag_id || undefined,
                  }
            )
          )
        );
        suggestedResources = outcomes
          .filter((o) => o.status === "fulfilled")
          .map((o) => o.value);
        const failedCount = outcomes.filter((o) => o.status === "rejected").length;
        if (failedCount > 0) {
          setResourceWarning(
            failedCount === stagedResources.length
              ? "Your answer posted, but the suggested resource(s) couldn't be attached."
              : `Your answer posted. ${failedCount} suggested resource(s) couldn't be attached.`
          );
        }
      }

      setBody("");
      setStagedResources([]);
      setSuccess(true);
      onPosted?.({ ...answer, suggested_resources: suggestedResources });
    } catch (err) {
      const apiError = err?.response?.data?.body;
      setError(
        Array.isArray(apiError) ? apiError[0] : apiError || "Couldn't post your answer. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const charCount = body.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = !submitting && body.trim() && !isOverLimit;

  return (
    <form onSubmit={handleSubmit} className="ans-form" noValidate>
      {/* ── Label Row ─────────────────────────────────────────────── */}
      <div className="ans-label-row">
        <label htmlFor="answer-body" className="ans-label">
          <IconSparkle size={16} className="icon-primary" />
          Your answer
        </label>

        <CharacterCounter current={charCount} max={MAX_CHARS} />
      </div>

      {/* ── Textarea Wrapper ────────────────────────────────────── */}
      <div className={`ans-textarea-wrap ${isFocused ? "focused" : ""}`}>
        <textarea
          ref={textareaRef}
          id="answer-body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Share how you'd approach this problem... Use markdown for formatting."
          rows={5}
          aria-invalid={Boolean(error) || isOverLimit}
          aria-describedby={error ? "answer-error" : undefined}
          disabled={submitting}
          className={`ans-textarea ${error || isOverLimit ? "error" : ""}`}
        />

        {/* Submit hint overlay */}
        <div className={`ans-submit-hint ${body.length > 0 && !submitting ? "visible" : ""}`}>
          Ctrl+Enter to submit
        </div>
      </div>

      {/* ── Suggest a resource ───────────────────────────────────── */}
      <SuggestResourcePanel staged={stagedResources} onChange={setStagedResources} />

      {/* ── Error Alert ───────────────────────────────────────────── */}
      {error && (
        <div id="answer-error" role="alert" className="ans-alert error">
          <div className="ans-alert-icon">
            <IconAlert size={16} className="icon-danger" />
          </div>
          <span className="ans-alert-text error">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="ans-alert-close"
          >
            <IconClose size={14} className="icon-danger" />
          </button>
        </div>
      )}

      {/* ── Resource Attach Warning (soft — answer still posted) ───── */}
      {resourceWarning && (
        <div role="status" className="ans-alert error">
          <div className="ans-alert-icon">
            <IconAlert size={16} className="icon-danger" />
          </div>
          <span className="ans-alert-text error">{resourceWarning}</span>
          <button
            type="button"
            onClick={() => setResourceWarning(null)}
            aria-label="Dismiss warning"
            className="ans-alert-close"
          >
            <IconClose size={14} className="icon-danger" />
          </button>
        </div>
      )}

      {/* ── Success Alert ─────────────────────────────────────────── */}
      {success && (
        <div role="status" className="ans-alert success">
          <IconCheck size={16} className="icon-success" />
          <span className="ans-alert-text success">Answer posted successfully!</span>
        </div>
      )}

      {/* ── Action Bar ────────────────────────────────────────────── */}
      <div className="ans-action-bar">
        {/* Left: Helper text */}
        <span className="ans-helper-text">
          {submitting
            ? "Posting your answer..."
            : "Be clear and helpful. Support your answer with examples when possible."}
        </span>

        {/* Right: Submit button */}
        <button
          type="submit"
          disabled={submitting || !body.trim() || isOverLimit}
          className={`ans-submit-btn ${canSubmit ? "active" : "disabled"} ${submitting ? "submitting" : ""}`}
        >
          {submitting ? (
            <>
              <span className="ans-spinner" />
              Posting…
            </>
          ) : (
            <>
              <IconSend size={16} className="icon-white" />
              Post answer
            </>
          )}
        </button>
      </div>
    </form>
  );
}