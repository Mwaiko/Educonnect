import { useState } from "react";
import { useNavigate } from "react-router-dom";
import forumApi from "../../api/forumApi";
import "./forumTheme.css";

const MAX_TITLE = 255;

/**
 * Ask Question Form.
 * Frontend Task: "Ask Question Form" (Mwai Komo, Module 2: Forum & Q&A).
 *
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
    if (!tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
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
    if (!title.trim()) next.title = "Give your question a title.";
    else if (title.length > MAX_TITLE) next.title = `Keep titles under ${MAX_TITLE} characters.`;
    if (!body.trim()) next.body = "Describe what you're stuck on.";
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
        setSubmitError("Couldn't post your question. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forum-root" style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
      <h1 className="forum-serif" style={{ fontSize: 28, marginBottom: 4 }}>
        Ask a question
      </h1>
      <p style={{ color: "var(--eq-graphite)", marginBottom: 24 }}>
        Be specific — a clear title and details help solvers respond faster.
      </p>

      {submitError && (
        <div role="alert" style={{ marginBottom: 16, color: "var(--eq-accent)" }}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div>
          <label htmlFor="question-title" style={fieldLabelStyle}>
            Title
          </label>
          <input
            id="question-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
            maxLength={MAX_TITLE}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            style={inputStyle}
          />
          <div style={helperRowStyle}>
            {errors.title ? (
              <span id="title-error" role="alert" style={errorTextStyle}>
                {Array.isArray(errors.title) ? errors.title[0] : errors.title}
              </span>
            ) : (
              <span />
            )}
            <span className="forum-mono" style={{ fontSize: 11, color: "var(--eq-graphite)" }}>
              {title.length}/{MAX_TITLE}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="question-body" style={fieldLabelStyle}>
            Details
          </label>
          <textarea
            id="question-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Explain what you've tried, what you expected, and where it goes wrong..."
            rows={8}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "body-error" : undefined}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
          {errors.body && (
            <span id="body-error" role="alert" style={errorTextStyle}>
              {Array.isArray(errors.body) ? errors.body[0] : errors.body}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="question-tags" style={fieldLabelStyle}>
            Tags
          </label>
          <div
            style={{
              ...inputStyle,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
              padding: "6px 8px",
            }}
          >
            {tags.map((t) => (
              <span
                key={t}
                className="forum-mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  background: "var(--eq-tag-bg)",
                  borderRadius: 4,
                  padding: "3px 6px 3px 8px",
                }}
              >
                #{t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--eq-graphite)",
                    fontSize: 13,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="question-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={tags.length === 0 ? "algorithms, graphs..." : "add another"}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: "1 1 100px",
                minWidth: 80,
                color: "var(--eq-ink)",
                fontSize: 14,
                padding: "4px 2px",
              }}
            />
          </div>
          <span className="forum-mono" style={{ fontSize: 11, color: "var(--eq-graphite)" }}>
            Press Enter or comma to add a tag.
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="forum-mono"
          style={{
            justifySelf: "start",
            padding: "10px 24px",
            background: "var(--eq-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Posting…" : "Post question"}
        </button>
      </form>
    </div>
  );
}

const fieldLabelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--eq-ink)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--eq-rule)",
  borderRadius: 6,
  background: "var(--eq-paper-raised)",
  color: "var(--eq-ink)",
  fontSize: 15,
};

const helperRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 4,
};

const errorTextStyle = {
  fontSize: 12,
  color: "var(--eq-accent)",
};
