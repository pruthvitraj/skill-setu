import api from './api';

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  read: (id) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.post('/notifications/read-all'),
};
