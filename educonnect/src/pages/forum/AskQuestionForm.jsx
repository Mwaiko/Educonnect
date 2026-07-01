import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import forumApi from "../../api/forumApi";
import { getTags } from "../../api/tags";
import "./forumTheme.css";

const MAX_TITLE = 255;

/**
 * Ask Question Form — EduConnect Design System v2
 * Talks to: POST /api/v1/forum/questions/
 *
 * Tags are picked from the shared curated taxonomy (leaf-level Tag rows
 * only) rather than typed freely — the backend's QuestionCreateSerializer
 * validates `tags` as a list of existing leaf Tag ids, so free text would
 * just 400.
 */
export default function AskQuestionForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]); // selected: [{id, name, breadcrumb}]
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsLoadError, setTagsLoadError] = useState(null);

  useEffect(() => {
    setTagsLoading(true);
    getTags({ level: "tag" })
      .then((res) => setAvailableTags(res.data?.results ?? res.data ?? []))
      .catch(() => setTagsLoadError("Could not load tags."))
      .finally(() => setTagsLoading(false));
  }, []);

  const suggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const query = tagInput.trim().toLowerCase();
    const selectedIds = new Set(tags.map((t) => t.id));
    return availableTags
      .filter((t) => !selectedIds.has(t.id))
      .filter((t) => `${t.name} ${t.breadcrumb ?? ""}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [tagInput, availableTags, tags]);

  const addTag = (tag) => {
    if (tags.length >= 5) {
      setErrors((prev) => ({ ...prev, tags: "Maximum 5 tags allowed." }));
      return;
    }
    if (!tags.some((t) => t.id === tag.id)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
    setErrors((prev) => { const { tags: _, ...rest } = prev; return rest; });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) addTag(suggestions[0]);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tagId) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
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
        tags: tags.map((t) => t.id),
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
            Add up to 5 tags to describe what your question is about — pick
            from the existing list, you can't create new ones here.
          </p>
          <div className={`tag-container ${errors.tags ? "error" : ""}`} style={{ position: "relative" }}>
            {tags.map((t) => (
              <span key={t.id} className="tag-chip" title={t.breadcrumb}>
                {t.name}
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  aria-label={`Remove tag ${t.name}`}
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
                placeholder={
                  tagsLoading
                    ? "Loading tags…"
                    : tags.length === 0
                    ? "e.g. algorithms, graphs..."
                    : "add another"
                }
                disabled={tagsLoading}
                className="tag-input"
                autoComplete="off"
              />
            )}

            {suggestions.length > 0 && (
              <ul
                className="tag-suggestions"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  margin: "4px 0 0",
                  padding: "4px",
                  listStyle: "none",
                  background: "var(--ec-surface, #fff)",
                  border: "1px solid var(--ec-border, #E2E8F0)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                {suggestions.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => addTag(t)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 10px",
                        background: "none",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                      title={t.breadcrumb}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-field-footer">
            {errors.tags ? (
              <span id="tags-error" role="alert" className="form-error-text">
                {Array.isArray(errors.tags) ? errors.tags[0] : errors.tags}
              </span>
            ) : tagsLoadError ? (
              <span role="alert" className="form-error-text">{tagsLoadError}</span>
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