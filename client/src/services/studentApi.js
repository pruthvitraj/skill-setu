import api from './api';

export const studentApi = {
  me: () => api.get('/students/me'),
  update: (payload) => api.patch('/students/me', payload),
  dashboard: () => api.get('/students/me/dashboard'),
  add: (field, payload) => api.post(`/students/me/${field}`, payload),
  updateItem: (field, itemId, payload) => api.put(`/students/me/${field}/${itemId}`, payload),
  removeItem: (field, itemId) => api.delete(`/students/me/${field}/${itemId}`),
  network: (params) => api.get('/students/network', { params }),
};
