import api from './api';

// ---- Auth ------------------------------------------------------------------
export const authService = {
  register: (payload) => api.post('/register', payload).then((r) => r.data),
  login: (payload) => api.post('/login', payload).then((r) => r.data),
  logout: () => api.post('/logout').then((r) => r.data),
  me: () => api.get('/user').then((r) => r.data.data),
};

// ---- Equipment items -------------------------------------------------------
export const itemService = {
  list: (params) => api.get('/items', { params }).then((r) => r.data),
  get: (id) => api.get(`/items/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/items', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/items/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/items/${id}`),
  setStatus: (id, status) => api.patch(`/items/${id}/status`, { status }).then((r) => r.data.data),
};

// ---- Requisitions ----------------------------------------------------------
export const requisitionService = {
  list: (params) => api.get('/requisitions', { params }).then((r) => r.data),
  create: (payload) => api.post('/requisitions', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/requisitions/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/requisitions/${id}`),
  setStatus: (id, status, remarks) =>
    api.patch(`/requisitions/${id}/status`, { status, remarks }).then((r) => r.data.data),
};

// ---- Personnel roster (admin only) ------------------------------------------
export const userService = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),
};

// ---- Dashboard + lookups ---------------------------------------------------
export const dashboardService = {
  get: () => api.get('/dashboard').then((r) => r.data),
  meta: () => api.get('/meta').then((r) => r.data),
};
