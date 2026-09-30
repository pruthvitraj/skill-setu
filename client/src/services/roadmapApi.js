import api from './api';

export const roadmapApi = {
  me: () => api.get('/roadmaps/me'),
  generate: (targetRole) => api.post('/roadmaps/me', { targetRole }),
  toggle: (itemId, completed) => api.patch(`/roadmaps/me/items/${itemId}`, { completed }),
};
