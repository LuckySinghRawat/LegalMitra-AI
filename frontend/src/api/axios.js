import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ===== Complaints API =====
export const complaintsAPI = {
  create: (data) => api.post('/complaints', data),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  delete: (id) => api.delete(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  downloadPDF: (id) => api.post(`/complaints/${id}/pdf`, {}, { responseType: 'blob' }),
  sendEmail: (id, recipientEmail) => api.post(`/complaints/${id}/email`, { recipientEmail }),
};

// ===== AI API =====
export const aiAPI = {
  analyze: (complaintId) => api.post('/ai/analyze', { complaintId }),
  generateLetter: (complaintId) => api.post('/ai/generate-letter', { complaintId }),
  suggestAuthority: (category, location) => api.post('/ai/suggest-authority', { category, location }),
};

// ===== Admin API =====
export const adminAPI = {
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  updateComplaint: (id, data) => api.patch(`/admin/complaints/${id}`, data),
};

// ===== Lawyers API =====
export const lawyersAPI = {
  search: (params) => api.get('/lawyers', { params }),
  detectCategory: (issue) => api.post('/lawyers/detect-category', { issue }),
  getCities: () => api.get('/lawyers/cities'),
};

export default api;
