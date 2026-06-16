import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import forumApi from "../../api/forumApi";
import { useAuth } from "../../hooks/useAuth";
import AnswerSubmissionForm from "./AnswerSubmissionForm";
import UpvoteButton from "./UpvoteButton";
import "./forumTheme.css";

/**
 * Question Detail Page.
 * Frontend Task: "Question Detail Page" (Mwai Komo, Module 2: Forum & Q&A).
 *
 * Talks to:
 *   GET  /api/v1/forum/questions/{id}/
 *   POST /api/v1/forum/questions/{id}/upvote/
 *   POST /api/v1/forum/answers/{id}/upvote/
 *   POST /api/v1/forum/answers/{id}/endorse/   (Expert Solver / Admin only)
 *   POST /api/v1/forum/answers/{id}/accept/    (question author only)
 */
export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await forumApi.getQuestion(questionId);
      setQuestion(data);
    } catch (err) {
      setError("Couldn't load this question.");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswerPosted = (newAnswer) => {
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            answers: [...prev.answers, newAnswer],
            answer_count: (prev.answer_count ?? prev.answers.length) + 1,
          }
        : prev
    );
  };

  const handleQuestionUpvote = async () => {
    const result = await forumApi.toggleQuestionUpvote(questionId);
    setQuestion((prev) => (prev ? { ...prev, upvote_count: result.upvote_count } : prev));
    return result;
  };

  const handleAnswerUpvote = async (answerId) => {
    const result = await forumApi.toggleAnswerUpvote(answerId);
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            answers: prev.answers.map((a) =>
              a.id === answerId ? { ...a, upvote_count: result.upvote_count } : a
            ),
          }
        : prev
    );
    return result;
  };

  const handleEndorse = async (answerId) => {
    setActionError(null);
    try {
      const result = await forumApi.toggleAnswerEndorsement(answerId);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((a) =>
                a.id === answerId ? { ...a, is_endorsed: result.is_endorsed } : a
              ),
            }
          : prev
      );
    } catch (err) {
      setActionError("Only Expert Solvers or Admins can endorse answers.");
    }
  };

  const handleAccept = async (answerId) => {
    setActionError(null);
    try {
      await forumApi.acceptAnswer(answerId);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              is_resolved: true,
              answers: prev.answers.map((a) => ({
                ...a,
                is_accepted: a.id === answerId,
              })),
            }
          : prev
      );
    } catch (err) {
      setActionError("Only the question author can accept an answer.");
    }
  };

  if (loading) {
    return (
      <div className="forum-root" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
        <p className="forum-mono" style={{ color: "var(--eq-graphite)" }}>
          Loading question…
        </p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="forum-root" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
        <p role="alert" style={{ color: "var(--eq-accent)" }}>
          {error || "Question not found."}
        </p>
      </div>
    );
  }

  const isQuestionAuthor = user?.id === question.author.id;
  const canEndorse = user?.role === "expert_solver" || user?.role === "admin";

  // Sort: accepted first, then endorsed, then by upvotes (server already
  // orders this way, but we re-sort defensively after local mutations).
  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) return a.is_accepted ? -1 : 1;
    if (a.is_endorsed !== b.is_endorsed) return a.is_endorsed ? -1 : 1;
    return b.upvote_count - a.upvote_count;
  });

  return (
    <div className="forum-root" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <article style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <UpvoteButton
          count={question.upvote_count}
          hasUpvoted={question.user_has_upvoted}
          onToggle={handleQuestionUpvote}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h1 className="forum-serif" style={{ fontSize: 26, margin: 0, fontWeight: 600 }}>
              {question.title}
            </h1>
            {question.is_resolved && (
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
          <p style={{ whiteSpace: "pre-wrap", marginTop: 12, lineHeight: 1.6 }}>{question.body}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            {question.tags.map((t) => (
              <span
                key={t}
                className="forum-mono"
                style={{
                  fontSize: 11,
                  background: "var(--eq-tag-bg)",
                  borderRadius: 4,
                  padding: "3px 8px",
                }}
              >
                #{t}
              </span>
            ))}
            <span className="forum-mono" style={{ fontSize: 11, color: "var(--eq-graphite)" }}>
              asked by {question.author.username}
            </span>
          </div>
        </div>
      </article>

      {actionError && (
        <p role="alert" style={{ color: "var(--eq-accent)", marginBottom: 16 }}>
          {actionError}
        </p>
      )}

      <h2 className="forum-serif" style={{ fontSize: 20, marginBottom: 12 }}>
        {sortedAnswers.length} {sortedAnswers.length === 1 ? "Answer" : "Answers"}
      </h2>

      {sortedAnswers.length === 0 ? (
        <p style={{ color: "var(--eq-graphite)", marginBottom: 24 }}>
          No answers yet — be the first to help.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, marginBottom: 28 }}>
          {sortedAnswers.map((answer) => (
            <li
              key={answer.id}
              style={{
                display: "flex",
                gap: 16,
                padding: 16,
                background: answer.is_accepted ? "var(--eq-accent-soft)" : "var(--eq-paper-raised)",
                border: `1px solid ${answer.is_accepted ? "var(--eq-accent)" : "var(--eq-rule)"}`,
                borderRadius: 8,
              }}
            >
              <UpvoteButton
                size="sm"
                count={answer.upvote_count}
                hasUpvoted={answer.user_has_upvoted}
                onToggle={() => handleAnswerUpvote(answer.id)}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  {answer.is_accepted && (
                    <span
                      className="forum-mono"
                      style={{ fontSize: 11, color: "var(--eq-accent)", fontWeight: 700 }}
                    >
                      ✓ Accepted answer
                    </span>
                  )}
                  {answer.is_endorsed && (
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
                      Expert endorsed
                    </span>
                  )}
                </div>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{answer.body}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
                  <span className="forum-mono" style={{ fontSize: 11, color: "var(--eq-graphite)" }}>
                    {answer.author.username}
                  </span>
                  {canEndorse && (
                    <button
                      type="button"
                      onClick={() => handleEndorse(answer.id)}
                      className="forum-mono"
                      style={inlineActionStyle(answer.is_endorsed)}
                    >
                      {answer.is_endorsed ? "Remove endorsement" : "Endorse"}
                    </button>
                  )}
                  {isQuestionAuthor && !answer.is_accepted && (
                    <button
                      type="button"
                      onClick={() => handleAccept(answer.id)}
                      className="forum-mono"
                      style={inlineActionStyle(false)}
                    >
                      Mark as accepted
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnswerSubmissionForm questionId={question.id} onPosted={handleAnswerPosted} />
    </div>
  );
}

function inlineActionStyle(active) {
  return {
    fontSize: 11,
    border: `1px solid ${active ? "var(--eq-verify)" : "var(--eq-rule)"}`,
    borderRadius: 4,
    padding: "3px 8px",
    background: active ? "var(--eq-verify-soft)" : "transparent",
    color: active ? "var(--eq-verify)" : "var(--eq-graphite)",
    cursor: "pointer",
  };
}
