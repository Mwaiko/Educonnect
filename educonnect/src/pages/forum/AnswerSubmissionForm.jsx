import { useState, useRef, useEffect } from "react";
import forumApi from "../../api/forumApi";
import "./forumTheme.css";

/**
 * Answer Submission Form — EduConnect Design System Implementation
 * ================================================================
 * Design Tokens (from educonnect_design_system.html):
 *   --ec-primary:       #4F46E5  (Indigo 600)
 *   --ec-primary-light: #EEF2FF  (Indigo 50)
 *   --ec-primary-mid:   #818CF8  (Indigo 400)
 *   --ec-primary-dark:  #312E81  (Indigo 900)
 *   --ec-accent:        #06B6D4  (Cyan 500)
 *   --ec-accent-light:  #ECFEFF
 *   --ec-success:       #10B981  (Emerald 500)
 *   --ec-success-light: #ECFDF5
 *   --ec-warning:       #F59E0B  (Amber 500)
 *   --ec-danger:        #EF4444  (Red 500)
 *   --ec-danger-light:  #FEF2F2
 *   --ec-surface:       #F8FAFC  (Slate 50)
 *   --ec-border:        rgba(79,70,229,0.18)
 *   --ec-text:          #1E1B4B  (Indigo 950)
 *   --ec-muted:         #6B7280
 *   --ec-white:         #FFFFFF
 *
 * Typography: Inter, system-ui, sans-serif
 * Border Radius: 6px (sm), 8px (md), 10px (lg), 12px (xl), 99px (pill)
 * Buttons: inline-flex, gap:7px, padding:9px 18px, font-size:14px, font-weight:500
 * Inputs: padding:9px 12px, border:1px solid rgba(79,70,229,0.25), border-radius:8px
 * Focus: border-color:var(--ec-primary), box-shadow:0 0 0 3px rgba(79,70,229,0.12)
 * Transitions: opacity 0.15s, all 0.2s ease
 */

/* ── Design System Token Object ───────────────────────────────────── */
const DS = {
  // Colors
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryMid: "#818CF8",
  primaryDark: "#312E81",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  surface: "#F8FAFC",
  border: "rgba(79,70,229,0.18)",
  borderFocus: "rgba(79,70,229,0.25)",
  text: "#1E1B4B",
  muted: "#6B7280",
  white: "#FFFFFF",

  // Typography
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontMono: "'SF Mono', 'Fira Code', monospace",

  // Spacing
  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",
  space5: "20px",
  space6: "24px",

  // Border radius
  radiusSm: "6px",
  radiusMd: "8px",
  radiusLg: "10px",
  radiusXl: "12px",
  radiusPill: "99px",

  // Shadows
  shadowFocus: "0 0 0 3px rgba(79,70,229,0.12)",
  shadowSm: "0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)",

  // Transitions
  transitionFast: "all 0.15s ease",
  transitionBase: "all 0.2s ease",
  transitionSlow: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

/* ── SVG Icons (inline, no deps) ──────────────────────────────────── */
function IconSend({ size = 16, color = DS.white }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconAlert({ size = 16, color = DS.danger }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconClose({ size = 14, color = DS.muted }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck({ size = 16, color = DS.success }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSparkle({ size = 18, color = DS.primaryMid }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  );
}

/* ── Character Counter ────────────────────────────────────────────── */
function CharacterCounter({ current, max, style = {} }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = current > max * 0.85;
  const isOverLimit = current > max;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: DS.space2,
        fontSize: 12,
        fontFamily: DS.fontFamily,
        color: isOverLimit ? DS.danger : isNearLimit ? DS.warning : DS.muted,
        fontWeight: 500,
        ...style,
      }}
    >
      <div
        style={{
          width: 40,
          height: 4,
          borderRadius: DS.radiusPill,
          background: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            borderRadius: DS.radiusPill,
            background: isOverLimit ? DS.danger : isNearLimit ? DS.warning : DS.primary,
            transition: DS.transitionBase,
          }}
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

    try {
      const answer = await forumApi.postAnswer(questionId, { body: trimmed });
      setBody("");
      setSuccess(true);
      onPosted?.(answer);
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        fontFamily: DS.fontFamily,
        position: "relative",
      }}
      noValidate
    >
      {/* ── Label Row ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: DS.space2,
        }}
      >
        <label
          htmlFor="answer-body"
          style={{
            display: "flex",
            alignItems: "center",
            gap: DS.space2,
            fontSize: 13,
            fontWeight: 600,
            color: DS.text,
            fontFamily: DS.fontFamily,
          }}
        >
          <IconSparkle size={16} color={DS.primary} />
          Your answer
        </label>

        <CharacterCounter current={charCount} max={MAX_CHARS} />
      </div>

      {/* ── Textarea Wrapper ────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: DS.radiusMd,
          transition: DS.transitionBase,
          boxShadow: isFocused ? DS.shadowFocus : "none",
        }}
      >
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
          style={{
            width: "100%",
            padding: "12px 14px",
            border: `1px solid ${error || isOverLimit ? DS.danger : isFocused ? DS.primary : DS.borderFocus}`,
            borderRadius: DS.radiusMd,
            background: DS.white,
            color: DS.text,
            fontSize: 14,
            fontFamily: DS.fontFamily,
            lineHeight: 1.6,
            resize: "vertical",
            minHeight: 120,
            outline: "none",
            transition: DS.transitionBase,
            cursor: submitting ? "not-allowed" : "text",
            opacity: submitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isFocused && !submitting && !error && !isOverLimit) {
              e.target.style.borderColor = DS.primaryMid;
            }
          }}
          onMouseLeave={(e) => {
            if (!isFocused && !error && !isOverLimit) {
              e.target.style.borderColor = DS.borderFocus;
            }
          }}
        />

        {/* Submit hint overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            fontSize: 11,
            color: DS.muted,
            fontFamily: DS.fontFamily,
            fontWeight: 500,
            pointerEvents: "none",
            opacity: body.length > 0 && !submitting ? 0.7 : 0,
            transition: DS.transitionFast,
            background: "rgba(255,255,255,0.9)",
            padding: "2px 6px",
            borderRadius: DS.radiusSm,
          }}
        >
          Ctrl+Enter to submit
        </div>
      </div>

      {/* ── Error Alert ───────────────────────────────────────────── */}
      {error && (
        <div
          id="answer-error"
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: DS.space2,
            marginTop: DS.space2,
            padding: "10px 14px",
            background: DS.dangerLight,
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: DS.radiusMd,
            animation: "ecSlideIn 0.3s ease-out",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <IconAlert size={16} color={DS.danger} />
          </div>
          <span
            style={{
              fontSize: 13,
              color: DS.danger,
              fontWeight: 500,
              flex: 1,
              lineHeight: 1.5,
            }}
          >
            {error}
          </span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              borderRadius: DS.radiusSm,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transition: DS.transitionFast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconClose size={14} color={DS.danger} />
          </button>
        </div>
      )}

      {/* ── Success Alert ─────────────────────────────────────────── */}
      {success && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: DS.space2,
            marginTop: DS.space2,
            padding: "10px 14px",
            background: DS.successLight,
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: DS.radiusMd,
            animation: "ecSlideIn 0.3s ease-out",
          }}
        >
          <IconCheck size={16} color={DS.success} />
          <span
            style={{
              fontSize: 13,
              color: "#065F46",
              fontWeight: 500,
              flex: 1,
            }}
          >
            Answer posted successfully!
          </span>
        </div>
      )}

      {/* ── Action Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: DS.space3,
          flexWrap: "wrap",
          gap: DS.space2,
        }}
      >
        {/* Left: Helper text */}
        <span
          style={{
            fontSize: 12,
            color: DS.muted,
            fontFamily: DS.fontFamily,
            fontWeight: 500,
          }}
        >
          {submitting
            ? "Posting your answer..."
            : "Be clear and helpful. Support your answer with examples when possible."}
        </span>

        {/* Right: Submit button */}
        <button
          type="submit"
          disabled={submitting || !body.trim() || isOverLimit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 18px",
            borderRadius: DS.radiusMd,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: DS.fontFamily,
            cursor: submitting || !body.trim() || isOverLimit ? "not-allowed" : "pointer",
            border: "none",
            background: submitting || !body.trim() || isOverLimit ? "#E2E8F0" : DS.primary,
            color: submitting || !body.trim() || isOverLimit ? DS.muted : DS.white,
            transition: DS.transitionFast,
            opacity: submitting ? 0.85 : 1,
            boxShadow: !submitting && body.trim() && !isOverLimit ? DS.shadowSm : "none",
          }}
          onMouseEnter={(e) => {
            if (!submitting && body.trim() && !isOverLimit) {
              e.currentTarget.style.background = DS.primaryDark;
              e.currentTarget.style.boxShadow = DS.shadowMd;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting && body.trim() && !isOverLimit) {
              e.currentTarget.style.background = DS.primary;
              e.currentTarget.style.boxShadow = DS.shadowSm;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {submitting ? (
            <>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${DS.white}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "ecSpin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Posting…
            </>
          ) : (
            <>
              <IconSend size={16} color={DS.white} />
              Post answer
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ── CSS Animations (add to forumTheme.css) ───────────────────────── */
/*
  @keyframes ecSlideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ecSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
*/