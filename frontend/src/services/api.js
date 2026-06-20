import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  googleLogin: (data) => api.post('/auth/google', data),
};

export const parkingAPI = {
  getSlots: (params) => api.get('/parking/slots', { params }),
  getSlotStats: () => api.get('/parking/slots/stats'),
  getSlot: (id) => api.get(`/parking/slots/${id}`),
  getDashboard: () => api.get('/parking/dashboard'),
  createBooking: (data) => api.post('/parking/bookings', data),
  getBookings: () => api.get('/parking/bookings'),
  cancelBooking: (id) => api.put(`/parking/bookings/${id}/cancel`),
  checkIn: (bookingId) => api.post('/parking/check-in', { bookingId }),
  checkOut: (bookingId) => api.post('/parking/check-out', { bookingId }),
  scanQR: (qrData) => api.post('/parking/scan-qr', { qrData }),
  search: (q) => api.get('/parking/search', { params: { q } }),
  getRecommendations: () => api.get('/parking/recommendations'),
  createSlot: (data) => api.post('/parking/slots', data),
  updateSlot: (id, data) => api.put(`/parking/slots/${id}`, data),
  deleteSlot: (id) => api.delete(`/parking/slots/${id}`),
};

export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const paymentAPI = {
  create: (data) => api.post('/payments/create', data),
  verify: (data) => api.post('/payments/verify', data),
  getAll: () => api.get('/payments'),
  getInvoice: (id) => api.get(`/payments/${id}/invoice`, { responseType: 'blob' }),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const trafficAPI = {
  getAll: () => api.get('/traffic'),
  getHeatMaps: (type) => api.get('/traffic/heatmap', { params: { type } }),
  getRoutes: (from, to) => api.get('/traffic/routes', { params: { from, to } }),
  getRoad: (id) => api.get(`/traffic/${id}`),
};

export const analyticsAPI = {
  getAnalytics: (period) => api.get('/analytics', { params: { period } }),
  getPredictions: () => api.get('/analytics/predictions'),
  getAdminStats: () => api.get('/analytics/admin/stats'),
  getUsers: () => api.get('/analytics/admin/users'),
  exportReport: (format) => api.get('/analytics/export', { params: { format }, responseType: 'blob' }),
};
