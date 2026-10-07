import api from './api';

export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  resources: (q) => api.get('/courses/resources', { params: { q } }),
  youtube: (q) => api.get('/courses/youtube', { params: { q } }),
  recommended: () => api.get('/courses/recommended'),
};
