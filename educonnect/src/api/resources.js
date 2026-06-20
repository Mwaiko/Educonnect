/**
 * src/api/resources.js
 * API helpers for the Resource Repository feature.
 * Place this file at: src/api/resources.js
 */

const BASE = "/api/v1/resources";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const getResources = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/${qs ? "?" + qs : ""}`, { headers: authHeaders() })
    .then((r) => r.json().then((data) => ({ data })));
};

export const createResource = (payload) =>
  fetch(`${BASE}/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then((r) => r.json().then((data) => ({ data })));

export const voteResource = (id, value) =>
  fetch(`${BASE}/${id}/vote/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ value }),
  }).then((r) => r.json().then((data) => ({ data })));

export const deleteResource = (id) =>
  fetch(`${BASE}/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });