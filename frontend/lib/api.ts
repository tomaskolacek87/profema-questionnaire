import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

// Patients API
export const patientsApi = {
  getAll: () => api.get('/patients'),
  getOne: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  search: (query: string) => api.get(`/patients/search?q=${query}`),
};

// Questionnaires API
export const questionnairesApi = {
  getAll: () => api.get('/questionnaires'),
  getOne: (id: string) => api.get(`/questionnaires/${id}`),
  getByPatient: (patientId: string) => api.get(`/questionnaires/patient/${patientId}`),
  create: (data: any) => api.post('/questionnaires', data),
  update: (id: string, data: any) => api.put(`/questionnaires/${id}`, data),
  complete: (id: string) => api.patch(`/questionnaires/${id}/complete`),
  delete: (id: string) => api.delete(`/questionnaires/${id}`),
};

// Google API
export const googleApi = {
  uploadQuestionnaire: (questionnaireId: string) =>
    api.post(`/google/upload/${questionnaireId}`),
};

// Statistics API
export const statisticsApi = {
  getOverview: () => api.get('/statistics/overview'),
  getRecentActivity: (limit?: number) => api.get(`/statistics/recent-activity${limit ? `?limit=${limit}` : ''}`),
  getSyncStatus: () => api.get('/statistics/sync-status'),
  getDateRange: (startDate: string, endDate: string) =>
    api.get(`/statistics/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Enhanced Questionnaires API
export const enhancedQuestionnairesApi = {
  ...questionnairesApi,
  downloadPdf: (id: string) => api.get(`/questionnaires/${id}/pdf`, { responseType: 'blob' }),
};
