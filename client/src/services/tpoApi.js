import api from './api';

export const tpoApi = {
  dashboard: () => api.get('/tpo/dashboard'),
  studentFilters: () => api.get('/tpo/student-filters'),
  students: (params) => api.get('/tpo/students', { params }),
  student: (id) => api.get(`/tpo/students/${id}`),
  studentReportCard: (id) => api.get(`/tpo/students/${id}/report-card`),
  skills: () => api.get('/tpo/skills/analytics'),
  internships: () => api.get('/tpo/internships'),
  companies: () => api.get('/tpo/companies'),
  placementAnalytics: () => api.get('/tpo/placement-analytics'),
  placementDrives: () => api.get('/tpo/placement-drives'),
  reviewPlacementDrive: (id, payload) => api.patch(`/tpo/placement-drives/${id}`, payload),
  applications: (params) => api.get('/tpo/applications', { params }),
  updateApplicationStatus: (id, payload) => api.patch(`/tpo/applications/${id}/status`, payload),
  interviews: () => api.get('/tpo/interviews'),
  announcements: () => api.get('/tpo/announcements'),
  createAnnouncement: (payload) => api.post('/tpo/announcements', payload),
  reports: (type) => api.get(`/tpo/reports/${type}`),
};
