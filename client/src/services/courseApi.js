import api from './api';

export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  recommended: () => api.get('/courses/recommended'),
};
