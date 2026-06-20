import { useCallback, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import forumApi from "./forumApi";

/**
 * Connects the forum API layer to the current auth state.
 *
 * This is the integration point between forumApi (raw axios bindings)
 * and useAuth (who's currently logged in). Forum components AND the
 * dashboard should both import from here rather than calling forumApi
 * directly, so that:
 *
 *   - write actions are blocked with a clear error when there's no
 *     authenticated user, instead of failing deep inside an axios call
 *   - loading/error state is handled once, not re-implemented in every
 *     component that calls the API
 *   - permission checks (isOwner, canModerate) are derived from the
 *     current user in one place, so the dashboard's "your questions",
 *     "needs moderation", etc. widgets stay consistent with the forum
 *     UI's own edit/delete/endorse buttons
 *
 * Swapping the stub AuthContext for the real one (feature-auth-profile)
 * requires no changes here, since this hook only relies on the
 * documented { user, isAuthenticated } shape.
 */
export function useForumApi() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (fn, { requireAuth = true } = {}) => {
      if (requireAuth && !isAuthenticated) {
        const authError = new Error("You must be signed in to do that.");
        setError(authError);
        throw authError;
      }
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Permission helpers, handy for both forum UI and dashboard widgets
  const isOwner = useCallback(
    (item) => !!user && !!item && item.author?.id === user.id,
    [user]
  );

  const canModerate = useMemo(
    () => user?.role === "moderator" || user?.role === "admin",
    [user]
  );

  return {
    // auth-derived state
    user,
    isAuthenticated,
    isOwner,
    canModerate,

    // request state
    loading,
    error,

    // read endpoints - viewable whether or not signed in
    listQuestions: (params) =>
      run(() => forumApi.listQuestions(params), { requireAuth: false }),
    getQuestion: (id) =>
      run(() => forumApi.getQuestion(id), { requireAuth: false }),
    listTags: () => run(() => forumApi.listTags(), { requireAuth: false }),

    // write endpoints - require a signed-in user
    createQuestion: (payload) => run(() => forumApi.createQuestion(payload)),
    updateQuestion: (id, payload) =>
      run(() => forumApi.updateQuestion(id, payload)),
    deleteQuestion: (id) => run(() => forumApi.deleteQuestion(id)),
    toggleQuestionUpvote: (id) =>
      run(() => forumApi.toggleQuestionUpvote(id)),
    postAnswer: (questionId, payload) =>
      run(() => forumApi.postAnswer(questionId, payload)),
    updateAnswer: (answerId, payload) =>
      run(() => forumApi.updateAnswer(answerId, payload)),
    toggleAnswerEndorsement: (answerId) =>
      run(() => forumApi.toggleAnswerEndorsement(answerId)),
    acceptAnswer: (answerId) => run(() => forumApi.acceptAnswer(answerId)),
    toggleAnswerUpvote: (answerId) =>
      run(() => forumApi.toggleAnswerUpvote(answerId)),
  };
}

export default useForumApi;