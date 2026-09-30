import api from './api';

export const analyticsApi = {
  me: () => api.get('/analytics/me'),
};
