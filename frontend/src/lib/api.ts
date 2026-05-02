import axios from 'axios';
import { mockAuth, mockAchievementAPI, mockNFTAPI } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || 
  (!API_BASE_URL.includes('railway') && !API_BASE_URL.includes('render') && !API_BASE_URL.includes('localhost:3001'));

console.log('🔧 API Configuration:', { 
  API_BASE_URL, 
  USE_MOCK_API,
  NODE_ENV: process.env.NODE_ENV 
});

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = USE_MOCK_API ? {
  register: async (data: any) => ({ data: await mockAuth.register(data) }),
  login: async (data: { email: string; password: string }) => ({ data: await mockAuth.login(data.email, data.password) }),
  verifyEmail: (token: string) => Promise.resolve({ data: { success: true } }),
} : {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

// User API
export const userAPI = USE_MOCK_API ? {
  getProfile: async () => ({ data: await mockAuth.getProfile() }),
  updateProfile: (data: any) => Promise.resolve({ data: { success: true } }),
  getDashboardStats: async () => ({ data: await mockAuth.getDashboardStats() }),
} : {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

// Achievement API
export const achievementAPI = USE_MOCK_API ? {
  create: (data: FormData) => Promise.resolve({ data: { success: true, message: 'Feature available after backend deployment' } }),
  getAll: mockAchievementAPI.getAll,
  getUserAchievements: mockAchievementAPI.getAll,
  getById: mockAchievementAPI.getById,
  update: (id: string, data: any) => Promise.resolve({ data: { success: true } }),
  delete: (id: string) => Promise.resolve({ data: { success: true } }),
  getPendingVerification: () => Promise.resolve({ data: [] }),
  verify: (id: string, data: any) => Promise.resolve({ data: { success: true } }),
  uploadProof: (data: FormData) => Promise.resolve({ data: { success: true, message: 'Feature available after backend deployment' } }),
} : {
  create: (data: FormData) => api.post('/achievements', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
  getById: (id: string) => api.get(`/achievements/${id}`),
  update: (id: string, data: any) => api.put(`/achievements/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
  getPendingVerification: () => api.get('/achievements/pending-verification'),
  verify: (id: string, data: any) => api.put(`/achievements/${id}/verify`, data),
  uploadProof: (data: FormData) => api.post('/achievements/upload-proof', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Task API
export const taskAPI = USE_MOCK_API ? {
  getAll: () => Promise.resolve({ data: [] }),
  create: (data: any) => Promise.resolve({ data: { success: true, message: 'Task creation available after backend deployment' } }),
  submit: (id: string) => Promise.resolve({ data: { success: true, message: 'Task submission available after backend deployment' } }),
  verify: (id: string) => Promise.resolve({ data: { success: true, message: 'Task verification available after backend deployment' } }),
  claim: (id: string) => Promise.resolve({ data: { success: true, message: 'Reward claiming available after backend deployment' } }),
} : {
  getAll: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  submit: (id: string) => api.post(`/tasks/${id}/submit`),
  verify: (id: string) => api.post(`/tasks/${id}/verify`),
  claim: (id: string) => api.post(`/tasks/${id}/claim`),
};

// Opportunity API
export const opportunityAPI = USE_MOCK_API ? {
  getAll: () => Promise.resolve({ data: [] }),
  requestAccess: (id: string) => Promise.resolve({ data: { success: true, message: 'Feature available after backend deployment' } }),
  getMyAccess: () => Promise.resolve({ data: [] }),
} : {
  getAll: () => api.get('/opportunities'),
  requestAccess: (id: string) => api.post(`/opportunities/${id}/request-access`),
  getMyAccess: () => api.get('/opportunities/my-access'),
};

export default api;