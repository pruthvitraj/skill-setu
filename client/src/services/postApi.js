import api from './api';

export const postApi = {
  list: (params) => api.get('/posts', { params }),
  create: (payload) => api.post('/posts', payload),
};
