import api from './api';

export const companyApi = {
  me: () => api.get('/recruiters/me'),
  updateMe: (data) => api.patch('/recruiters/me', data),
  dashboard: () => api.get('/recruiters/dashboard'),
  
  jobs: {
    list: (params) => api.get('/jobs/mine', { params }),
    get: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post('/jobs', data),
    update: (id, data) => api.patch(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
    matches: (id) => api.get(`/jobs/${id}/matches`),
  },
  
  candidates: {
    list: (params) => api.get('/recruiters/candidates', { params }),
    get: (id) => api.get(`/recruiters/candidates/${id}`),
  },
  
  applications: {
    list: (params) => api.get('/applications', { params }),
    get: (id) => api.get(`/applications/${id}`),
    updateStatus: (id, status, note) => api.patch(`/applications/${id}/status`, { status, note }),
  },
  
  interviews: {
    list: (params) => api.get('/interviews', { params }),
    create: (data) => api.post('/interviews', data),
    update: (id, data) => api.patch(`/interviews/${id}`, data),
  },
  
  messages: {
    conversations: () => api.get('/messages'),
    messages: (conversationId) => api.get(`/messages/${conversationId}`),
    send: (receiverId, body) => api.post('/messages', { receiverId, body }),
  },
  
  universities: {
    list: () => api.get('/recruiters/universities'),
    invite: (id, payload) => api.post(`/recruiters/universities/${id}/invite`, payload),
  },
  drives: () => api.get('/recruiters/placement-drives'),
  
  notifications: {
    list: (params) => api.get('/notifications', { params }),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.post('/notifications/read-all'),
  },
  
  analytics: {
    overview: () => api.get('/analytics/me'),
    jobs: () => api.get('/analytics/me'),
    pipeline: () => api.get('/analytics/me'),
  },
};