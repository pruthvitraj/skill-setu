import api from './api';

export const skillApi = {
  catalog: () => api.get('/skills'),
  assessments: () => api.get('/skills/assessments'),
  assessment: (id) => api.get(`/skills/assessments/${id}`),
  submit: (id, answers) => api.post(`/skills/assessments/${id}/attempts`, { answers }),
  tracker: () => api.get('/skills/tracker/me'),
};
