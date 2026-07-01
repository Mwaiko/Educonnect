import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import forumApi from "../../api/forumApi";
import { useAuth } from "../../hooks/useAuth";
import AnswerSubmissionForm from "./AnswerSubmissionForm";
import UpvoteButton from "./UpvoteButton";
import "./forumTheme.css";

/**
 * Question Detail Page — EduConnect Design System Implementation
 * ================================================================
 * All styling lives in forumTheme.css (see .qdp-*, .ec-* classes).
 */

/* ── SVG Icon Components (inline, no external deps) ─────────────── */
function IconArrowLeft({ size = 16, className = "icon-muted" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconCheck({ size = 14, className = "icon-success" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconStar({ size = 14, className = "icon-accent" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconMessage({ size = 20, className = "icon-primary" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconAlert({ size = 20, className = "icon-danger" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconClose({ size = 16, className = "icon-danger" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconEmpty({ size = 48, className = "icon-muted" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Avatar Component ───────────────────────────────────────────── */
function Avatar({ name, size = "md", color = "indigo" }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  return <div className={`ec-avatar size-${size} color-${color}`}>{initial}</div>;
}

/* ── Badge Component ────────────────────────────────────────────── */
function Badge({ children, variant = "indigo", icon = null, className = "" }) {
  return (
    <span className={`qdp-badge ${variant} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

/* ── Skeleton Loader ────────────────────────────────────────────── */
function SkeletonPulse({ height, width = "100%", marginBottom = 0, borderRadius = 6 }) {
  return (
    <div
      className="ec-skeleton-block"
      style={{ height, width, borderRadius, marginBottom }}
    />
  );
}

/* ── Main Component ───────────────────────────────────────────────── */
export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [activeAnswerId, setActiveAnswerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answersRef = useRef(null);

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

  // Auto-dismiss action errors after 5 seconds
  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

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
    setTimeout(() => {
      answersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleQuestionUpvote = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await forumApi.toggleQuestionUpvote(questionId);
      setQuestion((prev) =>
        prev
          ? { ...prev, upvote_count: result.upvote_count, user_has_upvoted: result.user_has_upvoted }
          : prev
      );
    } catch (err) {
      setActionError("Failed to upvote question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerUpvote = async (answerId) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await forumApi.toggleAnswerUpvote(answerId);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((a) =>
                a.id === answerId
                  ? { ...a, upvote_count: result.upvote_count, user_has_upvoted: result.user_has_upvoted }
                  : a
              ),
            }
          : prev
      );
    } catch (err) {
      setActionError("Failed to upvote answer.");
    } finally {
      setIsSubmitting(false);
    }
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

  /* ── Loading State ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="qdp-container">
        {/* Skeleton Question Card */}
        <div className="qdp-card qdp-skel-card">
          <div className="qdp-skel-row">
            <div className="qdp-skel-side">
              <SkeletonPulse height={40} width={40} borderRadius={8} />
              <SkeletonPulse height={16} width={30} borderRadius={4} />
            </div>
            <div className="qdp-skel-main">
              <SkeletonPulse height={32} width="70%" borderRadius={8} marginBottom={16} />
              <SkeletonPulse height={16} width="100%" borderRadius={4} marginBottom={8} />
              <SkeletonPulse height={16} width="85%" borderRadius={4} marginBottom={8} />
              <SkeletonPulse height={16} width="60%" borderRadius={4} marginBottom={20} />
              <div className="qdp-skel-footer">
                <SkeletonPulse height={24} width={80} borderRadius={99} />
                <SkeletonPulse height={24} width={80} borderRadius={99} />
                <div className="qdp-skel-meta">
                  <SkeletonPulse height={28} width={28} borderRadius={99} />
                  <SkeletonPulse height={16} width={100} borderRadius={4} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Answer Card */}
        <div className="qdp-card">
          <div className="qdp-skel-row">
            <div className="qdp-skel-side">
              <SkeletonPulse height={36} width={36} borderRadius={8} />
              <SkeletonPulse height={14} width={28} borderRadius={4} />
            </div>
            <div className="qdp-skel-main">
              <SkeletonPulse height={80} width="100%" borderRadius={6} marginBottom={12} />
              <div className="qdp-skel-footer-answer">
                <SkeletonPulse height={26} width={26} borderRadius={99} />
                <SkeletonPulse height={14} width={80} borderRadius={4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error State ───────────────────────────────────────────────── */
  if (error || !question) {
    return (
      <div className="qdp-container">
        <div role="alert" className="qdp-error-box">
          <div className="qdp-error-icon">
            <IconAlert size={48} className="icon-danger" />
          </div>
          <p className="qdp-error-text">{error || "Question not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="ec-btn-base ec-btn-danger-ghost qdp-error-back-btn"
          >
            <IconArrowLeft size={16} className="" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isQuestionAuthor = user?.id === question.author.id;
  const canEndorse = user?.role === "expert_solver" || user?.role === "admin";

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) return a.is_accepted ? -1 : 1;
    if (a.is_endorsed !== b.is_endorsed) return a.is_endorsed ? -1 : 1;
    return b.upvote_count - a.upvote_count;
  });

  return (
    <div className="qdp-container">
      {/* ── Breadcrumb Navigation ───────────────────────────────── */}
      <nav className="qdp-nav">
        <button
          onClick={() => navigate(-1)}
          className="ec-btn-base ec-btn-ghost ec-btn-sm"
        >
          <IconArrowLeft size={14} className="icon-primary" />
          Back to Forum
        </button>
      </nav>

      {/* ── Question Card ─────────────────────────────────────── */}
      <article className="qdp-card qdp-question-card">
        {/* Decorative accent line on left */}
        <div className={`qdp-accent-bar ${question.is_resolved ? "resolved" : ""}`} />

        {/* Upvote Section */}
        <div className="qdp-upvote-col">
          <UpvoteButton
            count={question.upvote_count}
            hasUpvoted={question.user_has_upvoted}
            onToggle={handleQuestionUpvote}
            disabled={isSubmitting}
          />
        </div>

        {/* Question Content */}
        <div className="qdp-content">
          {/* Title Row */}
          <div className="qdp-title-row">
            <h1 className="qdp-title">{question.title}</h1>
            {question.is_resolved && (
              <Badge variant="green" icon={<IconCheck size={12} className="icon-success" />}>
                Resolved
              </Badge>
            )}
          </div>

          {/* Body */}
          <div className="qdp-body">{question.body}</div>

          {/* Metadata Row */}
          <div className="qdp-meta-row">
            {/* Tags */}
            {question.tags.map((t) => (
              <span key={t.id} title={t.breadcrumb}>
                <Badge variant="indigo" className="qdp-tag-badge">
                  #{t.name}
                </Badge>
              </span>
            ))}

            {/* Author & Date */}
            <div className="qdp-author-date">
              <Avatar name={question.author.username} size="md" color="indigo" />
              <span className="qdp-author-name">
                {question.author.username}
                <span className="qdp-dot">·</span>
                {question.created_at
                  ? new Date(question.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* ── Action Error Toast ──────────────────────────────────── */}
      {actionError && (
        <div role="alert" className="qdp-toast">
          <IconAlert size={20} className="icon-danger" />
          <span className="qdp-toast-text">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
            className="qdp-toast-close"
          >
            <IconClose size={16} className="icon-danger" />
          </button>
        </div>
      )}

      {/* ── Answers Section Header ──────────────────────────────── */}
      <div ref={answersRef} className="qdp-answers-header">
        <h2 className="qdp-answers-title">
          <span className="qdp-answers-count">{sortedAnswers.length}</span>
          {sortedAnswers.length === 1 ? "Answer" : "Answers"}
        </h2>

        <span className="qdp-answers-sort-hint">Sorted by relevance</span>
      </div>

      {/* ── Empty State ─────────────────────────────────────────── */}
      {sortedAnswers.length === 0 ? (
        <div className="qdp-empty">
          <div className="qdp-empty-icon">
            <IconEmpty size={48} className="icon-muted" />
          </div>
          <p className="qdp-empty-title">No answers yet</p>
          <p className="qdp-empty-sub">
            Be the first to share your knowledge and help out.
          </p>
        </div>
      ) : (
        <ul className="qdp-answers-list">
          {sortedAnswers.map((answer, index) => {
            const isActive = activeAnswerId === answer.id;
            const stateClass = answer.is_accepted
              ? "accepted"
              : answer.is_endorsed
              ? "endorsed"
              : "";

            return (
              <li
                key={answer.id}
                className={`qdp-answer-card ${stateClass} ${isActive ? "active" : ""}`}
                onMouseEnter={() => setActiveAnswerId(answer.id)}
                onMouseLeave={() => setActiveAnswerId(null)}
              >
                {/* Rank number (decorative, faded) */}
                <div className="qdp-answer-rank">{index + 1}</div>

                {/* Upvote Column */}
                <div className="qdp-upvote-col">
                  <UpvoteButton
                    size="sm"
                    count={answer.upvote_count}
                    hasUpvoted={answer.user_has_upvoted}
                    onToggle={() => handleAnswerUpvote(answer.id)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Answer Content */}
                <div className="qdp-answer-content">
                  {/* Badges Row */}
                  <div className="qdp-answer-badges">
                    {answer.is_accepted && (
                      <Badge variant="green" icon={<IconCheck size={12} className="icon-success" />}>
                        Accepted answer
                      </Badge>
                    )}
                    {answer.is_endorsed && (
                      <Badge variant="cyan" icon={<IconStar size={12} className="icon-accent" />}>
                        Expert endorsed
                      </Badge>
                    )}
                  </div>

                  {/* Body */}
                  <p className="qdp-answer-body">{answer.body}</p>

                  {/* Footer Actions */}
                  <div className="qdp-answer-footer">
                    {/* Author */}
                    <div className="qdp-answer-author">
                      <Avatar
                        name={answer.author.username}
                        size="sm"
                        color={answer.is_accepted ? "green" : answer.is_endorsed ? "cyan" : "gray"}
                      />
                      <span className="qdp-answer-author-name">{answer.author.username}</span>
                    </div>

                    {/* Endorse Button */}
                    {canEndorse && (
                      <button
                        type="button"
                        onClick={() => handleEndorse(answer.id)}
                        className={
                          answer.is_endorsed
                            ? "ec-btn-base ec-btn-sm ec-btn-endorsed"
                            : "ec-btn-base ec-btn-sm ec-btn-ghost ec-btn-endorse"
                        }
                      >
                        <IconStar size={14} className="" />
                        {answer.is_endorsed ? "Endorsed" : "Endorse"}
                      </button>
                    )}

                    {/* Accept Button */}
                    {isQuestionAuthor && !answer.is_accepted && (
                      <button
                        type="button"
                        onClick={() => handleAccept(answer.id)}
                        className="ec-btn-base ec-btn-sm ec-btn-ghost ec-btn-accept"
                      >
                        <IconCheck size={14} className="" />
                        Accept answer
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Answer Form Card ────────────────────────────────────── */}
      <div className="qdp-card qdp-answer-form-card">
        <h3 className="qdp-answer-form-title">
          <IconMessage size={20} className="icon-primary" />
          Your Answer
        </h3>
        <AnswerSubmissionForm questionId={question.id} onPosted={handleAnswerPosted} />
      </div>
    </div>
  );
}