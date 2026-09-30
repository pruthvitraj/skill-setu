import api from './api';

export const recruiterApi = {
  me: () => api.get('/recruiters/me'),
  dashboard: () => api.get('/recruiters/dashboard'),
  candidates: (params) => api.get('/recruiters/candidates', { params }),
  candidate: (id) => api.get(`/recruiters/candidates/${id}`),
  universities: () => api.get('/recruiters/universities'),
  invite: (id, payload) => api.post(`/recruiters/universities/${id}/invite`, payload),
};
