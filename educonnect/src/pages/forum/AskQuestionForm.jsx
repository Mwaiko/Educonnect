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
        setSubmitError("Couldn't post your question. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      {/* Header */}
      <div className="form-header">
        <h1 className="form-title">Ask a question</h1>
        <p className="form-subtitle">
          Be specific — a clear title and details help solvers respond faster.{" "}
          <a href="#" className="form-link">
            How to ask a good question
          </a>
        </p>
      </div>

      {/* Global error */}
      {submitError && (
        <div role="alert" className="form-alert-error">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        {/* ── Title ── */}
        <div className="form-card">
          <label htmlFor="question-title" className="form-label">
            Title
          </label>
          <p className="form-hint">
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
            className={`ec-input ${errors.title ? "error" : ""}`}
          />
          <div className="form-field-footer">
            {errors.title ? (
              <span id="title-error" role="alert" className="form-error-text">
                {Array.isArray(errors.title) ? errors.title[0] : errors.title}
              </span>
            ) : (
              <span />
            )}
            <span className="form-char-count">
              {title.length}/{MAX_TITLE}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="form-card">
          <label htmlFor="question-body" className="form-label">
            What are the details of your problem?
          </label>
          <p className="form-hint">
            Explain what you've tried, what you expected, and where it goes
            wrong. Include code snippets if relevant.
          </p>
          <textarea
            id="question-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="I'm working on a graph problem where..."
            rows={10}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "body-error" : undefined}
            className={`ec-input ${errors.body ? "error" : ""}`}
          />
          <div className="form-field-footer">
            {errors.body ? (
              <span id="body-error" role="alert" className="form-error-text">
                {Array.isArray(errors.body) ? errors.body[0] : errors.body}
              </span>
            ) : (
              <span />
            )}
            <span className="form-char-count">{body.length} chars</span>
          </div>
        </div>

        {/* ── Tags ── */}
        <div className="form-card">
          <label htmlFor="question-tags" className="form-label">
            Tags
          </label>
          <p className="form-hint">
            Add up to 5 tags to describe what your question is about.
          </p>
          <div className={`tag-container ${errors.tags ? "error" : ""}`}>
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  aria-label={`Remove tag ${t}`}
                  className="tag-remove-btn"
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
                className="tag-input"
              />
            )}
          </div>
          <div className="form-field-footer">
            {errors.tags ? (
              <span id="tags-error" role="alert" className="form-error-text">
                {Array.isArray(errors.tags) ? errors.tags[0] : errors.tags}
              </span>
            ) : (
              <span />
            )}
            <span className="form-char-count">{tags.length}/5 tags</span>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className="ec-btn-base ec-btn-primary"
          >
            {submitting ? "Posting…" : "Post your question"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ec-btn-base ec-btn-ghost"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}