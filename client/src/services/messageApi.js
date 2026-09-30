import api from './api';

export const messageApi = {
  list: () => api.get('/messages'),
  thread: (id) => api.get(`/messages/${id}`),
  send: (payload) => api.post('/messages', payload),
};
