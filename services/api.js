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

// Student API calls (with localStorage fallback for demo)
const LOCAL_STUDENTS_KEY = 'sv5t_students';
const ensureDemoStudents = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
    const demo = [
      { _id: 's1', mssv: '2024001001', fullName: 'Nguyễn Văn A', faculty: 'Công nghệ Thông tin', gpa: 3.45, evaluationStatus: 'ELIGIBLE', readinessScore: 88 },
      { _id: 's2', mssv: '2024001002', fullName: 'Trần Thị B', faculty: 'Công nghệ Thông tin', gpa: 3.78, evaluationStatus: 'ELIGIBLE', readinessScore: 94 },
      { _id: 's3', mssv: '2024002001', fullName: 'Lê Hoàng C', faculty: 'Kinh tế - Quản trị', gpa: 2.85, evaluationStatus: 'ALMOST_READY', readinessScore: 68 },
      { _id: 's4', mssv: '2024003001', fullName: 'Phạm Minh D', faculty: 'Cơ khí - Kỹ thuật', gpa: 2.65, evaluationStatus: 'NOT_ELIGIBLE', readinessScore: 42 },
      { _id: 's5', mssv: '2024004001', fullName: 'Võ Thị E', faculty: 'Ngôn ngữ & Văn hóa', gpa: 3.52, evaluationStatus: 'ELIGIBLE', readinessScore: 82 },
    ];
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(demo));
    return demo;
  } catch {
    return [];
  }
};

export const studentAPI = {
  getAll: async (params) => {
    try {
      // If local demo data exists, use it for fast UI demo
      const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
      if (raw) {
        return { data: { success: true, data: JSON.parse(raw) } };
      }
      const res = await apiClient.get(`/students/all`, { params });
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        try { localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(res.data.data)); } catch {}
      }
      return res;
    } catch (error) {
      // Fallback to demo if backend is unavailable
      const demo = ensureDemoStudents();
      return { data: { success: true, data: demo } };
    }
  },
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

// Scholarship API
export const scholarshipAPI = {
  getAll: (params) => apiClient.get(`/scholarships`, { params }),
  getById: (id) => apiClient.get(`/scholarships/${id}`),
  create: (data) => apiClient.post(`/scholarships`, data),
  update: (id, data) => apiClient.put(`/scholarships/${id}`, data),
  delete: (id) => apiClient.delete(`/scholarships/${id}`),
  getActive: () => apiClient.get(`/scholarships/status/active`),
  getExpired: () => apiClient.get(`/scholarships/status/expired`)
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
    document.body.removeChild(link);
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
  scholarshipAPI,
  downloadCSV
};
