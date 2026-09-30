import api from './api';

export const placementApi = {
  list: () => api.get('/placement-drives'),
  review: (id, payload) => api.patch(`/placement-drives/${id}`, payload),
};
