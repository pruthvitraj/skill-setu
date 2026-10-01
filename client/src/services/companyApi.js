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
    get: (id) => api.get(`/interviews/${id}`),
    create: (data) => api.post('/interviews', data),
    update: (id, data) => api.patch(`/interviews/${id}`, data),
    delete: (id) => api.delete(`/interviews/${id}`),
  },
  
  messages: {
    conversations: () => api.get('/messages/conversations'),
    messages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
    send: (conversationId, body) => api.post(`/messages/conversations/${conversationId}`, { body }),
  },
  
  universities: {
    list: () => api.get('/recruiters/universities'),
    invite: (id, payload) => api.post(`/recruiters/universities/${id}/invite`, payload),
  },
  drives: () => api.get('/recruiters/placement-drives'),
  
  notifications: {
    list: (params) => api.get('/notifications', { params }),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
  },
  
  analytics: {
    overview: () => api.get('/analytics/recruiter/overview'),
    jobs: () => api.get('/analytics/recruiter/jobs'),
    pipeline: () => api.get('/analytics/recruiter/pipeline'),
  },
};