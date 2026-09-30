import api from './api';

export const jobApi = {
  list: (params) => api.get('/jobs', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  mine: (params) => api.get('/jobs/mine', { params }),
  create: (payload) => api.post('/jobs', payload),
  update: (id, payload) => api.patch(`/jobs/${id}`, payload),
  matches: (id) => api.get(`/jobs/${id}/matches`),
};
