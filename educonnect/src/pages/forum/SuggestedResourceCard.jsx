import "./answerResources.css";

/**
 * SuggestedResourceCard
 * ---------------------------------------------------------------------
 * Renders one AnswerResource (the shape returned in an answer's
 * `suggested_resources` array from AnswerSerializer) as a small card
 * under that answer.
 *
 * Usage, wherever answers are rendered (e.g. inside your AnswerCard /
 * question detail component):
 *
 *   {answer.suggested_resources?.map((sr) => (
 *     <SuggestedResourceCard
 *       key={sr.id}
 *       suggestion={sr}
 *       canRemove={sr.suggested_by.id === currentUser.id}
 *       onRemove={() => forumApi
 *         .removeAnswerResource(answer.id, sr.resource.id)
 *         .then(() => refreshAnswer())}
 *     />
 *   ))}
 */

const TYPE_LABELS = {
  textbook: "Textbook",
  article: "Article",
  video: "Video",
  website: "Website",
  other: "Resource",
};

function IconLink({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function SuggestedResourceCard({ suggestion, canRemove = false, onRemove }) {
  const { resource, suggested_by: suggestedBy } = suggestion;
  if (!resource) return null;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ares-card"
    >
      <div className="ares-card-icon">
        <IconLink size={16} />
      </div>
      <div className="ares-card-body">
        <div className="ares-card-title">{resource.title}</div>
        <div className="ares-card-meta">
          {resource.resource_type && (
            <span className="ares-card-type">{TYPE_LABELS[resource.resource_type] || resource.resource_type}</span>
          )}
          {resource.tag?.breadcrumb && (
            <span className="ares-card-tag">{resource.tag.breadcrumb}</span>
          )}
          {suggestedBy?.username && (
            <span className="ares-card-suggester">Suggested by {suggestedBy.username}</span>
          )}
        </div>
      </div>
      {canRemove && (
        <button
          type="button"
          className="ares-card-remove"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label={`Remove suggested resource ${resource.title}`}
        >
          ✕
        </button>
      )}
    </a>
  );
}