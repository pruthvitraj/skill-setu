import api from './api';

export const applicationApi = {
  apply: (payload) => api.post('/applications', payload),
  mine: () => api.get('/applications/me'),
  list: (params) => api.get('/applications', { params }),
  get: (id) => api.get(`/applications/${id}`),
  status: (id, payload) => api.patch(`/applications/${id}/status`, payload),
};
