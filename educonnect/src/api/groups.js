import api from './axios';

export const getGroups = (params) => api.get('/groups/', { params });

export const getGroup = (id) => api.get(`/groups/${id}/`);

export const createGroup = (data) => api.post('/groups/', data);

export const joinGroup = (id) => api.post(`/groups/${id}/join/`);

export const leaveGroup = (id) => api.delete(`/groups/${id}/leave/`);

export const createMeetingLink = (id, data) => api.post(`/groups/${id}/meetings/`, data);

export const getMatchedGroups = () => api.get('/groups/match/');