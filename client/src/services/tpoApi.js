import api from './api';

export const tpoApi = {
  dashboard: () => api.get('/tpo/dashboard'),
  students: (params) => api.get('/tpo/students', { params }),
  student: (id) => api.get(`/tpo/students/${id}`),
  skills: () => api.get('/tpo/skills/analytics'),
  internships: () => api.get('/tpo/internships'),
  companies: () => api.get('/tpo/companies'),
  announcements: () => api.get('/tpo/announcements'),
  createAnnouncement: (payload) => api.post('/tpo/announcements', payload),
  reports: (type) => api.get(`/tpo/reports/${type}`),
};
