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
 * Design Tokens Used:
 *   Primary:   #4F46E5  (--ec-primary)
 *   Primary Light: #EEF2FF (--ec-primary-light)
 *   Primary Mid:   #818CF8 (--ec-primary-mid)
 *   Primary Dark:  #312E81 (--ec-primary-dark)
 *   Accent:    #06B6D4  (--ec-accent)
 *   Accent Light:  #ECFEFF (--ec-accent-light)
 *   Success:   #10B981  (--ec-success)
 *   Warning:   #F59E0B  (--ec-warning)
 *   Danger:    #EF4444  (--ec-danger)
 *   Surface:   #F8FAFC  (--ec-surface)
 *   Border:    rgba(79,70,229,0.18) (--ec-border)
 *   Text:      #1E1B4B  (--ec-text)
 *   Muted:     #6B7280  (--ec-muted)
 *   White:     #FFFFFF  (--ec-white)
 *
 * Typography: Inter, system-ui, sans-serif
 * Border Radius: 8px (buttons), 10px (cards), 12px (large cards), 99px (badges/pills)
 * Shadows: Subtle elevation system
 * Motion: 0.15s–0.3s ease transitions
 */

/* ── Inline Styles (Design System Tokens) ─────────────────────────── */
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
  text: "#1E1B4B",
  muted: "#6B7280",
  white: "#FFFFFF",

  // Typography
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontMono: "'SF Mono', 'Fira Code', monospace",

  // Spacing scale
  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",
  space5: "20px",
  space6: "24px",
  space8: "32px",
  space10: "40px",

  // Border radius
  radiusSm: "6px",
  radiusMd: "8px",
  radiusLg: "10px",
  radiusXl: "12px",
  radiusPill: "99px",

  // Shadows
  shadowSm: "0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)",
  shadowLg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  shadowHover: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",

  // Transitions
  transitionFast: "all 0.15s ease",
  transitionBase: "all 0.2s ease",
  transitionSlow: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

/* ── Reusable Style Helpers ───────────────────────────────────────── */
const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  fontFamily: DS.fontFamily,
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  borderRadius: DS.radiusMd,
  padding: "9px 18px",
  transition: DS.transitionFast,
};

const btnPrimary = {
  ...btnBase,
  background: DS.primary,
  color: DS.white,
};

const btnSecondary = {
  ...btnBase,
  background: DS.primaryLight,
  color: DS.primary,
  border: `1px solid ${DS.border}`,
};

const btnGhost = {
  ...btnBase,
  background: "transparent",
  color: DS.primary,
  border: `1px solid ${DS.border}`,
};

const btnDanger = {
  ...btnBase,
  background: DS.dangerLight,
  color: DS.danger,
  border: "1px solid rgba(239,68,68,0.25)",
};

const btnSm = {
  padding: "6px 13px",
  fontSize: "12px",
  borderRadius: DS.radiusSm,
};

const badgeBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "3px 10px",
  borderRadius: DS.radiusPill,
  fontSize: "12px",
  fontWeight: 500,
  fontFamily: DS.fontFamily,
};

const cardBase = {
  background: DS.white,
  border: `0.5px solid ${DS.border}`,
  borderRadius: DS.radiusLg,
  transition: DS.transitionSlow,
};

const inputBase = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusMd,
  fontSize: "14px",
  fontFamily: DS.fontFamily,
  background: DS.white,
  color: DS.text,
  outline: "none",
  transition: DS.transitionBase,
};

/* ── SVG Icon Components (inline, no external deps) ─────────────── */
function IconArrowLeft({ size = 16, color = DS.muted }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconCheck({ size = 14, color = DS.success }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconStar({ size = 14, color = DS.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconMessage({ size = 20, color = DS.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconAlert({ size = 20, color = DS.danger }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconClose({ size = 16, color = DS.danger }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconEmpty({ size = 48, color = DS.muted }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Avatar Component ───────────────────────────────────────────── */
function Avatar({ name, size = 34, color = "indigo", style = {} }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const colorMap = {
    indigo: { bg: DS.primary, text: DS.white },
    cyan: { bg: DS.accent, text: DS.white },
    green: { bg: DS.success, text: DS.white },
    amber: { bg: DS.warning, text: DS.white },
    gray: { bg: "#F1F5F9", text: "#475569" },
  };
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size > 30 ? 12 : 11,
        fontWeight: 600,
        fontFamily: DS.fontFamily,
        background: c.bg,
        color: c.text,
        border: "2px solid white",
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}

/* ── Badge Component ────────────────────────────────────────────── */
function Badge({ children, variant = "indigo", icon = null, style = {} }) {
  const variantMap = {
    indigo: { bg: DS.primaryLight, color: DS.primary },
    cyan: { bg: DS.accentLight, color: "#0E7490" },
    green: { bg: DS.successLight, color: "#065F46" },
    amber: { bg: DS.warningLight, color: "#92400E" },
    red: { bg: DS.dangerLight, color: "#991B1B" },
    gray: { bg: "#F1F5F9", color: "#475569" },
  };
  const v = variantMap[variant] || variantMap.indigo;
  return (
    <span
      style={{
        ...badgeBase,
        background: v.bg,
        color: v.color,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ── Skeleton Loader ────────────────────────────────────────────── */
function SkeletonPulse({ height, width = "100%", marginBottom = 0, borderRadius = 6 }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: "#E2E8F0",
        marginBottom,
        animation: "ecPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
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
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: `${DS.space10} ${DS.space6}`,
          fontFamily: DS.fontFamily,
        }}
      >
        {/* Skeleton Question Card */}
        <div
          style={{
            ...cardBase,
            padding: "28px 24px",
            marginBottom: DS.space6,
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 48 }}>
              <SkeletonPulse height={40} width={40} borderRadius={8} />
              <SkeletonPulse height={16} width={30} borderRadius={4} />
            </div>
            <div style={{ flex: 1 }}>
              <SkeletonPulse height={32} width="70%" borderRadius={8} marginBottom={16} />
              <SkeletonPulse height={16} width="100%" borderRadius={4} marginBottom={8} />
              <SkeletonPulse height={16} width="85%" borderRadius={4} marginBottom={8} />
              <SkeletonPulse height={16} width="60%" borderRadius={4} marginBottom={20} />
              <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: `1px solid ${DS.border}` }}>
                <SkeletonPulse height={24} width={80} borderRadius={99} />
                <SkeletonPulse height={24} width={80} borderRadius={99} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <SkeletonPulse height={28} width={28} borderRadius={99} />
                  <SkeletonPulse height={16} width={100} borderRadius={4} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Answer Card */}
        <div
          style={{
            ...cardBase,
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 48 }}>
              <SkeletonPulse height={36} width={36} borderRadius={8} />
              <SkeletonPulse height={14} width={28} borderRadius={4} />
            </div>
            <div style={{ flex: 1 }}>
              <SkeletonPulse height={80} width="100%" borderRadius={6} marginBottom={12} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${DS.border}` }}>
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
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: `${DS.space10} ${DS.space6}`,
          fontFamily: DS.fontFamily,
        }}
      >
        <div
          role="alert"
          style={{
            background: DS.dangerLight,
            border: `1px solid rgba(239,68,68,0.25)`,
            borderRadius: DS.radiusXl,
            padding: `${DS.space6} ${DS.space8}`,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <IconAlert size={48} color={DS.danger} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: 0, color: DS.danger }}>
            {error || "Question not found."}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16,
              ...btnGhost,
              borderColor: "rgba(239,68,68,0.25)",
              color: DS.danger,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = DS.danger;
              e.currentTarget.style.color = DS.white;
              e.currentTarget.style.borderColor = DS.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = DS.danger;
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
            }}
          >
            <IconArrowLeft size={16} color="currentColor" />
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
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: `${DS.space10} ${DS.space6}`,
        fontFamily: DS.fontFamily,
        color: DS.text,
      }}
    >
      {/* ── Breadcrumb Navigation ───────────────────────────────── */}
      <nav style={{ marginBottom: DS.space6 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...btnGhost,
            ...btnSm,
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = DS.primaryLight;
            e.currentTarget.style.borderColor = DS.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = DS.border;
          }}
        >
          <IconArrowLeft size={14} color={DS.primary} />
          Back to Forum
        </button>
      </nav>

      {/* ── Question Card ─────────────────────────────────────── */}
      <article
        style={{
          ...cardBase,
          padding: "28px 24px",
          marginBottom: DS.space8,
          boxShadow: DS.shadowMd,
          display: "flex",
          gap: 20,
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = DS.shadowLg;
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = DS.shadowMd;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Decorative accent line on left */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 24,
            bottom: 24,
            width: 3,
            borderRadius: "0 4px 4px 0",
            background: question.is_resolved ? DS.success : DS.primary,
          }}
        />

        {/* Upvote Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: DS.space2,
            minWidth: 48,
            paddingTop: 4,
          }}
        >
          <UpvoteButton
            count={question.upvote_count}
            hasUpvoted={question.user_has_upvoted}
            onToggle={handleQuestionUpvote}
            disabled={isSubmitting}
          />
        </div>

        {/* Question Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title Row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: DS.space3,
              flexWrap: "wrap",
              marginBottom: DS.space4,
            }}
          >
            <h1
              style={{
                fontSize: 28,
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.3,
                color: DS.primaryDark,
                letterSpacing: "-0.02em",
                fontFamily: DS.fontFamily,
              }}
            >
              {question.title}
            </h1>
            {question.is_resolved && (
              <Badge variant="green" icon={<IconCheck size={12} color={DS.success} />}>
                Resolved
              </Badge>
            )}
          </div>

          {/* Body */}
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              fontSize: 15,
              color: "#374151",
              marginBottom: DS.space5,
            }}
          >
            {question.body}
          </div>

          {/* Metadata Row */}
          <div
            style={{
              display: "flex",
              gap: DS.space2,
              flexWrap: "wrap",
              alignItems: "center",
              paddingTop: DS.space4,
              borderTop: `0.5px solid ${DS.border}`,
            }}
          >
            {/* Tags */}
            {question.tags.map((t) => (
              <Badge
                key={t}
                variant="indigo"
                style={{
                  cursor: "default",
                  transition: DS.transitionBase,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = DS.primary;
                  e.currentTarget.style.color = DS.white;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = DS.primaryLight;
                  e.currentTarget.style.color = DS.primary;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                #{t}
              </Badge>
            ))}

            {/* Author & Date */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: DS.space2,
                marginLeft: "auto",
              }}
            >
              <Avatar name={question.author.username} size={28} color="indigo" />
              <span
                style={{
                  fontSize: 13,
                  color: DS.muted,
                  fontFamily: DS.fontFamily,
                }}
              >
                {question.author.username}
                <span style={{ margin: "0 6px", color: DS.border }}>·</span>
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
        <div
          role="alert"
          style={{
            background: DS.dangerLight,
            border: `1px solid rgba(239,68,68,0.25)`,
            borderRadius: DS.radiusXl,
            padding: "14px 20px",
            marginBottom: DS.space6,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "ecSlideIn 0.3s ease-out",
            boxShadow: DS.shadowMd,
          }}
        >
          <IconAlert size={20} color={DS.danger} />
          <span
            style={{
              color: DS.danger,
              fontSize: 14,
              fontWeight: 500,
              flex: 1,
              fontFamily: DS.fontFamily,
            }}
          >
            {actionError}
          </span>
          <button
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: DS.danger,
              cursor: "pointer",
              padding: 4,
              borderRadius: DS.radiusSm,
              display: "flex",
              alignItems: "center",
              transition: DS.transitionFast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconClose size={16} color={DS.danger} />
          </button>
        </div>
      )}

      {/* ── Answers Section Header ──────────────────────────────── */}
      <div
        ref={answersRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: DS.space5,
          paddingBottom: DS.space3,
          borderBottom: `2px solid ${DS.border}`,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            margin: 0,
            fontWeight: 700,
            color: DS.primaryDark,
            fontFamily: DS.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              background: DS.primary,
              color: DS.white,
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: DS.fontFamily,
            }}
          >
            {sortedAnswers.length}
          </span>
          {sortedAnswers.length === 1 ? "Answer" : "Answers"}
        </h2>

        <span
          style={{
            fontSize: 12,
            color: DS.muted,
            fontFamily: DS.fontFamily,
            fontWeight: 500,
          }}
        >
          Sorted by relevance
        </span>
      </div>

      {/* ── Empty State ─────────────────────────────────────────── */}
      {sortedAnswers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: `${DS.space8} ${DS.space6}`,
            background: DS.white,
            borderRadius: DS.radiusLg,
            border: `2px dashed ${DS.border}`,
            marginBottom: DS.space8,
            transition: DS.transitionSlow,
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DS.primary;
            e.currentTarget.style.background = DS.primaryLight;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = DS.shadowMd;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DS.border;
            e.currentTarget.style.background = DS.white;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ marginBottom: 16, opacity: 0.6 }}>
            <IconEmpty size={48} color={DS.muted} />
          </div>
          <p
            style={{
              color: DS.muted,
              fontSize: 16,
              fontWeight: 500,
              margin: "0 0 8px 0",
              fontFamily: DS.fontFamily,
            }}
          >
            No answers yet
          </p>
          <p
            style={{
              color: DS.muted,
              fontSize: 14,
              margin: 0,
              fontFamily: DS.fontFamily,
            }}
          >
            Be the first to share your knowledge and help out.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: `0 0 ${DS.space8} 0`,
            display: "flex",
            flexDirection: "column",
            gap: DS.space4,
          }}
        >
          {sortedAnswers.map((answer, index) => {
            const isActive = activeAnswerId === answer.id;
            const borderColor = answer.is_accepted
              ? DS.success
              : answer.is_endorsed
              ? DS.accent
              : DS.border;
            const bgColor = answer.is_accepted
              ? DS.successLight
              : answer.is_endorsed
              ? DS.accentLight
              : DS.white;

            return (
              <li
                key={answer.id}
                style={{
                  ...cardBase,
                  padding: "24px",
                  display: "flex",
                  gap: 20,
                  borderLeftWidth: 3,
                  borderLeftColor: borderColor,
                  borderLeftStyle: "solid",
                  background: bgColor,
                  position: "relative",
                  overflow: "hidden",
                  transition: DS.transitionSlow,
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isActive ? DS.shadowLg : DS.shadowSm,
                }}
                onMouseEnter={() => setActiveAnswerId(answer.id)}
                onMouseLeave={() => setActiveAnswerId(null)}
              >
                {/* Rank number (decorative, faded) */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    fontSize: 48,
                    fontWeight: 800,
                    color: DS.border,
                    opacity: 0.3,
                    lineHeight: 1,
                    fontFamily: DS.fontMono,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {index + 1}
                </div>

                {/* Upvote Column */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: DS.space2,
                    minWidth: 48,
                    paddingTop: 4,
                  }}
                >
                  <UpvoteButton
                    size="sm"
                    count={answer.upvote_count}
                    hasUpvoted={answer.user_has_upvoted}
                    onToggle={() => handleAnswerUpvote(answer.id)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Answer Content */}
                <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                  {/* Badges Row */}
                  <div
                    style={{
                      display: "flex",
                      gap: DS.space2,
                      flexWrap: "wrap",
                      marginBottom: DS.space3,
                      alignItems: "center",
                    }}
                  >
                    {answer.is_accepted && (
                      <Badge variant="green" icon={<IconCheck size={12} color={DS.success} />}>
                        Accepted answer
                      </Badge>
                    )}
                    {answer.is_endorsed && (
                      <Badge variant="cyan" icon={<IconStar size={12} color={DS.accent} />}>
                        Expert endorsed
                      </Badge>
                    )}
                  </div>

                  {/* Body */}
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                      fontSize: 15,
                      color: "#374151",
                      margin: "0 0 16px 0",
                      fontFamily: DS.fontFamily,
                    }}
                  >
                    {answer.body}
                  </p>

                  {/* Footer Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: DS.space3,
                      alignItems: "center",
                      flexWrap: "wrap",
                      paddingTop: DS.space3,
                      borderTop: `0.5px solid ${DS.border}`,
                    }}
                  >
                    {/* Author */}
                    <div style={{ display: "flex", alignItems: "center", gap: DS.space2 }}>
                      <Avatar
                        name={answer.author.username}
                        size={26}
                        color={answer.is_accepted ? "green" : answer.is_endorsed ? "cyan" : "gray"}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: DS.muted,
                          fontFamily: DS.fontFamily,
                          fontWeight: 500,
                        }}
                      >
                        {answer.author.username}
                      </span>
                    </div>

                    {/* Endorse Button */}
                    {canEndorse && (
                      <button
                        type="button"
                        onClick={() => handleEndorse(answer.id)}
                        style={
                          answer.is_endorsed
                            ? {
                                ...btnSecondary,
                                ...btnSm,
                                background: DS.accentLight,
                                color: DS.accent,
                                borderColor: DS.accent,
                              }
                            : {
                                ...btnGhost,
                                ...btnSm,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!answer.is_endorsed) {
                            e.currentTarget.style.background = DS.accentLight;
                            e.currentTarget.style.borderColor = DS.accent;
                            e.currentTarget.style.color = DS.accent;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!answer.is_endorsed) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = DS.border;
                            e.currentTarget.style.color = DS.primary;
                          }
                        }}
                      >
                        <IconStar size={14} color="currentColor" />
                        {answer.is_endorsed ? "Endorsed" : "Endorse"}
                      </button>
                    )}

                    {/* Accept Button */}
                    {isQuestionAuthor && !answer.is_accepted && (
                      <button
                        type="button"
                        onClick={() => handleAccept(answer.id)}
                        style={{
                          ...btnGhost,
                          ...btnSm,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = DS.successLight;
                          e.currentTarget.style.borderColor = DS.success;
                          e.currentTarget.style.color = DS.success;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = DS.border;
                          e.currentTarget.style.color = DS.primary;
                        }}
                      >
                        <IconCheck size={14} color="currentColor" />
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
      <div
        style={{
          ...cardBase,
          padding: "28px 24px",
          boxShadow: DS.shadowMd,
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: `0 0 ${DS.space5} 0`,
            color: DS.primaryDark,
            fontFamily: DS.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IconMessage size={20} color={DS.primary} />
          Your Answer
        </h3>
        <AnswerSubmissionForm questionId={question.id} onPosted={handleAnswerPosted} />
      </div>
    </div>
  );
}

