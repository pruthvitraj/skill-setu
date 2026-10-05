import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillsetu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('skillsetu_token');
      window.dispatchEvent(new Event('skillsetu-session-expired'));
    }
    return Promise.reject(err.response?.data || { success: false, message: 'Network error', errorCode: 'NETWORK' });
  }
);

export default api;
