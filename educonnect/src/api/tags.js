import api from "./axios";

// Same convention as dashboardApi / Resources.js: `api` already carries the
// /api/v1 base URL and auth header, so paths here are relative to that.

// No params -> top-level categories. Pass { parent: <uuid> } to walk down
// the tree, or { level: 'category' | 'subcategory' | 'tag' } to fetch a
// whole level flat.
export const getTags = (params = {}) => api.get("/tags/", { params });