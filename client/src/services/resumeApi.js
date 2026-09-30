import api from './api';

export const resumeApi = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resumes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  latest: () => api.get('/resumes/latest'),
  list: () => api.get('/resumes'),
  remove: (id) => api.delete(`/resumes/${id}`),
};
