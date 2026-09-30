import api from './api';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgot: (email) => api.post('/auth/forgot-password', { email }),
  reset: (payload) => api.post('/auth/reset-password', payload),
  verify: (token) => api.post('/auth/verify-email', { token }),
};
