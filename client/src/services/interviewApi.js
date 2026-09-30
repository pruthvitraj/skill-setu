import api from './api';

export const interviewApi = {
  list: () => api.get('/interviews'),
  create: (payload) => api.post('/interviews', payload),
  update: (id, payload) => api.patch(`/interviews/${id}`, payload),
};
