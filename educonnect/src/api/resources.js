import api from './axios';

export const getResources = (params) => api.get('/resources/', { params });

export const getResource = (id) => api.get(`/resources/${id}/`);

export const createResource = (data) => api.post('/resources/', data);

export const updateResource = (id, data) => api.patch(`/resources/${id}/`, data);

export const deleteResource = (id) => api.delete(`/resources/${id}/`);

export const voteResource = (id, value) => api.post(`/resources/${id}/vote/`, { value });
