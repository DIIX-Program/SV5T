import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv5t_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('sv5t_token');
      localStorage.removeItem('sv5t_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => axios.post(`${API_BASE_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  adminLogin: (data) => axios.post(`${API_BASE_URL}/auth/login`, data), // Now uses the same endpoint
  getCurrentUser: () => apiClient.get(`/auth/me`),
  logout: () => {
    localStorage.removeItem('sv5t_token');
    localStorage.removeItem('sv5t_user');
    return Promise.resolve();
  }
};

// Student API calls
export const studentAPI = {
  getAll: (params) => apiClient.get(`/students/all`, { params }),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post(`/students`, data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getByFaculty: (faculty) => apiClient.get(`/students/faculty/${faculty}`),
  getStatistics: (params) => apiClient.get(`/students/statistics`, { params }),
  getProfile: () => apiClient.get(`/students/profile`)
};

// Event API calls
export const eventAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/events/all`, { params }),
  getUpcoming: (params) => axios.get(`${API_BASE_URL}/events/upcoming`, { params }),
  getByMonth: (month, year) => axios.get(`${API_BASE_URL}/events/month/${month}/${year}`),
  getArchive: (params) => axios.get(`${API_BASE_URL}/events/archive`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/events/${id}`),
  create: (data) => apiClient.post(`/events`, data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  archivePastEvents: () => apiClient.post(`/events/archive/batch`)
};

// Analytics API calls
export const analyticsAPI = {
  analyze: (params) => apiClient.get(`/analytics/analyze`, { params }),
  getDatasetML: (params) => apiClient.get(`/analytics/dataset-ml`, { params }),
  exportCSV: (params) => {
    return apiClient.get(`/analytics/export-csv`, {
      params,
      responseType: 'blob'
    });
  },
  saveReport: (data) => apiClient.post(`/analytics/save-report`, data),
  getRecentAnalytics: () => apiClient.get(`/analytics/recent`)
};

// Utility function to download CSV
export const downloadCSV = async (params) => {
  try {
    const response = await analyticsAPI.exportCSV(params);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student-dataset-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentURL.removeChild(link);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
};

export default {
  authAPI,
  studentAPI,
  eventAPI,
  analyticsAPI,
  downloadCSV
};
