import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Doctors API
export const doctorsApi = {
  getAll: () => axios.get(`${API_URL}/doctors`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  getOne: (id: string) => axios.get(`${API_URL}/doctors/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  create: (data: any) => axios.post(`${API_URL}/doctors`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  update: (id: string, data: any) => axios.patch(`${API_URL}/doctors/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  delete: (id: string) => axios.delete(`${API_URL}/doctors/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
};

// Appointments API
export const appointmentsApi = {
  getAll: (params?: { startDate?: string; endDate?: string; doctorId?: string }) =>
    axios.get(`${API_URL}/appointments`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    }),
  getOne: (id: string) => axios.get(`${API_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  getByDoctor: (doctorId: string, params?: { startDate?: string; endDate?: string }) =>
    axios.get(`${API_URL}/appointments/doctor/${doctorId}`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    }),
  getToday: () => axios.get(`${API_URL}/appointments/today`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  getUpcoming: (days?: number) => axios.get(`${API_URL}/appointments/upcoming`, {
    params: { days },
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  create: (data: any) => axios.post(`${API_URL}/appointments`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  update: (id: string, data: any) => axios.patch(`${API_URL}/appointments/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
  cancel: (id: string, reason?: string) => axios.patch(`${API_URL}/appointments/${id}/cancel`,
    { reason },
    { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
  ),
  delete: (id: string) => axios.delete(`${API_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  }),
};
