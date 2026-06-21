import { useState } from "react";
import { useNavigate } from "react-router-dom";
import forumApi from "../../api/forumApi";
import "./forumTheme.css";

const MAX_TITLE = 255;

/**
 * Ask Question Form — EduConnect Design System v2
 * Inspired by Stack Overflow's clear title/body/tag separation + inline guidance.
 * Talks to: POST /api/v1/forum/questions/
 */
export default function AskQuestionForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!cleaned) return;
    if (tags.length >= 5) {
      setErrors((prev) => ({ ...prev, tags: "Maximum 5 tags allowed." }));
      return;
    }
    if (!tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
    setErrors((prev) => { const { tags: _, ...rest } = prev; return rest; });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    else if (title.length > MAX_TITLE)
      next.title = `Title must be under ${MAX_TITLE} characters.`;
    if (!body.trim()) next.body = "Please describe your question in detail.";
    else if (body.length < 30)
      next.body = "Add a bit more detail (at least 30 characters).";
    if (tags.length === 0) next.tags = "Add at least one tag to help others find your question.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const question = await forumApi.createQuestion({
        title: title.trim(),
        body: body.trim(),
        tags,
      });
      navigate(`/forum/questions/${question.id}`);
    } catch (err) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors);
      } else {
        setSubmitError("Couldn\'t post your question. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── EduConnect design tokens ── */
  const primary = "#4F46E5";
  const primaryLight = "#EEF2FF";
  const primaryDark = "#312E81";
  const accent = "#06B6D4";
  const danger = "#EF4444";
  const text = "#1E1B4B";
  const muted = "#6B7280";
  const border = "rgba(79,70,229,0.18)";
  const surface = "#F8FAFC";
  const white = "#FFFFFF";

  const font = "'Inter', 'Anthropic Sans', system-ui, sans-serif";

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: font,
        color: text,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: primaryDark,
            marginBottom: 6,
            letterSpacing: "-0.3px",
          }}
        >
          Ask a question
        </h1>
        <p style={{ fontSize: 14, color: muted, lineHeight: 1.5 }}>
          Be specific — a clear title and details help solvers respond faster.
          {" "}
          <a
            href="#"
            style={{ color: primary, textDecoration: "none", fontWeight: 500 }}
          >
            How to ask a good question
          </a>
        </p>
      </div>

      {/* Global error */}
      {submitError && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: "12px 14px",
            background: "#FEF2F2",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8,
            color: danger,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
        {/* ── Title ── */}
        <div
          style={{
            background: white,
            border: `0.5px solid ${border}`,
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <label
            htmlFor="question-title"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: text,
              marginBottom: 6,
            }}
          >
            Title
          </label>
          <p style={{ fontSize: 12, color: muted, marginBottom: 10 }}>
            Summarize your problem in one sentence. Start with “How”, “What”,
            or “Why”.
          </p>
          <input
            id="question-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
            maxLength={MAX_TITLE}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.title ? danger : border}`,
              borderRadius: 8,
              background: white,
              color: text,
              fontSize: 15,
              fontFamily: font,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primary;
              e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.title ? danger : border;
              e.target.style.boxShadow = "none";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            {errors.title ? (
              <span
                id="title-error"
                role="alert"
                style={{ fontSize: 12, color: danger, fontWeight: 500 }}
              >
                {Array.isArray(errors.title) ? errors.title[0] : errors.title}
              </span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontSize: 11,
                color: muted,
                fontFamily: "monospace",
              }}
            >
              {title.length}/{MAX_TITLE}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            background: white,
            border: `0.5px solid ${border}`,
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <label
            htmlFor="question-body"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: text,
              marginBottom: 6,
            }}
          >
            What are the details of your problem?
          </label>
          <p style={{ fontSize: 12, color: muted, marginBottom: 10 }}>
            Explain what you\'ve tried, what you expected, and where it goes
            wrong. Include code snippets if relevant.
          </p>
          <textarea
            id="question-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="I\'m working on a graph problem where..."
            rows={10}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "body-error" : undefined}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.body ? danger : border}`,
              borderRadius: 8,
              background: white,
              color: text,
              fontSize: 14,
              fontFamily: font,
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primary;
              e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.body ? danger : border;
              e.target.style.boxShadow = "none";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            {errors.body ? (
              <span
                id="body-error"
                role="alert"
                style={{ fontSize: 12, color: danger, fontWeight: 500 }}
              >
                {Array.isArray(errors.body) ? errors.body[0] : errors.body}
              </span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontSize: 11,
                color: muted,
                fontFamily: "monospace",
              }}
            >
              {body.length} chars
            </span>
          </div>
        </div>

        {/* ── Tags ── */}
        <div
          style={{
            background: white,
            border: `0.5px solid ${border}`,
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <label
            htmlFor="question-tags"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: text,
              marginBottom: 6,
            }}
          >
            Tags
          </label>
          <p style={{ fontSize: 12, color: muted, marginBottom: 10 }}>
            Add up to 5 tags to describe what your question is about.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              padding: "8px 10px",
              border: `1px solid ${errors.tags ? danger : border}`,
              borderRadius: 8,
              background: white,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = primary;
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(79,70,229,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.tags ? danger : border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: primaryLight,
                  color: primary,
                  borderRadius: 99,
                  padding: "4px 12px",
                }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: primary,
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                id="question-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={
                  tags.length === 0
                    ? "e.g. algorithms, graphs..."
                    : "add another"
                }
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  flex: "1 1 120px",
                  minWidth: 100,
                  color: text,
                  fontSize: 14,
                  fontFamily: font,
                  padding: "4px 2px",
                }}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            {errors.tags ? (
              <span
                id="tags-error"
                role="alert"
                style={{ fontSize: 12, color: danger, fontWeight: 500 }}
              >
                {Array.isArray(errors.tags) ? errors.tags[0] : errors.tags}
              </span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontSize: 11,
                color: muted,
                fontFamily: "monospace",
              }}
            >
              {tags.length}/5 tags
            </span>
          </div>
        </div>

        {/* ── Submit ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "11px 28px",
              background: primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: font,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.target.style.opacity = 0.88;
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.target.style.opacity = 1;
            }}
          >
            {submitting ? "Posting…" : "Post your question"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "11px 20px",
              background: "transparent",
              color: primary,
              border: `1px solid ${border}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: font,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = primaryLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
            }}
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}