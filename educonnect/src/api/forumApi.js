import axios from "axios";

const API_BASE = "/api/v1";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptors run outside React, so they can't call useAuth()
// directly. Instead, on a 401 we clear the stale token and broadcast a
// DOM event. Whichever AuthContext/AuthProvider is mounted (the current
// stub, or the real one from feature-auth-profile once merged) can
// listen for "auth:unauthorized" and update its state / redirect to
// login accordingly. This keeps forumApi decoupled from whatever auth
// implementation is active.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

/**
 * Forum & Q&A API bindings.
 * Maps directly to the endpoints documented in section 8.3 / 8.4
 * of the EduConnect technical documentation.
 */
export const forumApi = {
  // GET /api/v1/forum/questions/
  listQuestions: (params = {}) =>
    client.get("/forum/questions/", { params }).then((res) => res.data),

  // POST /api/v1/forum/questions/
  createQuestion: (payload) =>
    client.post("/forum/questions/", payload).then((res) => res.data),

  // GET /api/v1/forum/questions/{id}/
  getQuestion: (id) =>
    client.get(`/forum/questions/${id}/`).then((res) => res.data),

  // PATCH /api/v1/forum/questions/{id}/
  updateQuestion: (id, payload) =>
    client.patch(`/forum/questions/${id}/`, payload).then((res) => res.data),

  // DELETE /api/v1/forum/questions/{id}/
  deleteQuestion: (id) => client.delete(`/forum/questions/${id}/`),

  // POST /api/v1/forum/questions/{id}/upvote/
  toggleQuestionUpvote: (id) =>
    client.post(`/forum/questions/${id}/upvote/`).then((res) => res.data),

  // POST /api/v1/forum/questions/{id}/answers/
  postAnswer: (questionId, payload) =>
    client
      .post(`/forum/questions/${questionId}/answers/`, payload)
      .then((res) => res.data),

  // PATCH /api/v1/forum/answers/{id}/
  updateAnswer: (answerId, payload) =>
    client.patch(`/forum/answers/${answerId}/`, payload).then((res) => res.data),

  // POST /api/v1/forum/answers/{id}/endorse/
  toggleAnswerEndorsement: (answerId) =>
    client.post(`/forum/answers/${answerId}/endorse/`).then((res) => res.data),

  // POST /api/v1/forum/answers/{id}/accept/
  acceptAnswer: (answerId) =>
    client.post(`/forum/answers/${answerId}/accept/`).then((res) => res.data),

  // POST /api/v1/forum/answers/{id}/upvote/
  toggleAnswerUpvote: (answerId) =>
    client.post(`/forum/answers/${answerId}/upvote/`).then((res) => res.data),

  // GET /api/v1/forum/tags/
  listTags: () => client.get("/forum/tags/").then((res) => res.data),
};

export default forumApi;