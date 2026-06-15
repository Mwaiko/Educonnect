import { useState } from "react";
import forumApi from "../../api/forumApi";
import "./forumTheme.css";

/**
 * Answer Submission Form.
 * Frontend Task: "Answer Submission Form" (Mwai Komo, Module 2: Forum & Q&A).
 *
 * Talks to: POST /api/v1/forum/questions/{question_id}/answers/
 *
 * Props:
 *   questionId - UUID of the question being answered
 *   onPosted   - callback invoked with the new answer object on success
 */
export default function AnswerSubmissionForm({ questionId, onPosted }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write an answer before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const answer = await forumApi.postAnswer(questionId, { body: trimmed });
      setBody("");
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

  return (
    <form onSubmit={handleSubmit} className="forum-root" style={{ marginTop: 8 }}>
      <label htmlFor="answer-body" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
        Your answer
      </label>
      <textarea
        id="answer-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share how you'd approach this..."
        rows={5}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "answer-error" : undefined}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid var(--eq-rule)",
          borderRadius: 6,
          background: "var(--eq-paper-raised)",
          color: "var(--eq-ink)",
          fontSize: 14,
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
      {error && (
        <p id="answer-error" role="alert" style={{ fontSize: 12, color: "var(--eq-accent)", marginTop: 4 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="forum-mono"
        style={{
          marginTop: 10,
          padding: "8px 20px",
          background: "var(--eq-ink)",
          color: "var(--eq-paper)",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Posting…" : "Post answer"}
      </button>
    </form>
  );
}
