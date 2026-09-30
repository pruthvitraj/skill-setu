import api from './api';

export const postApi = {
  list: (params) => api.get('/posts', { params }),
  create: (payload) => api.post('/posts', payload),
  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),
  remove: (id) => api.delete(`/posts/${id}`),
};
