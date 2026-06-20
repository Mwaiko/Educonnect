import api from "./axios";
 
// Shared axios instance already carries the base URL (.../api/v1) and auth
// header, so paths here are relative to that — same convention as the rest
// of the app's API modules (see dashboardApi in dashboard.jsx).
 
export const getResources = (params = {}) => api.get("/resources/", { params });
 
export const createResource = (data) => api.post("/resources/", data);
 
export const voteResource = (id, value) => api.post(`/resources/${id}/vote/`, { value });
 

export const deleteResource = (id) => api.delete(`/resources/${id}/`);