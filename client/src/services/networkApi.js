import api from './api';

export const networkApi = {
  student: () => api.get('/network/student'),
  company: () => api.get('/network/company'),
};