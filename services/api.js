import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Student API calls
export const studentAPI = {
  getAll: (params) => axios.get(`${API_BASE_URL}/students/all`, { params }),
  getById: (id) => axios.get(`${API_BASE_URL}/students/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/students`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/students/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/students/${id}`),
  getByFaculty: (faculty) => axios.get(`${API_BASE_URL}/students/faculty/${faculty}`),
  getStatistics: (params) => axios.get(`${API_BASE_URL}/students/statistics`, { params })
};

// Analytics API calls
export const analyticsAPI = {
  analyze: (params) => axios.get(`${API_BASE_URL}/analytics/analyze`, { params }),
  getDatasetML: (params) => axios.get(`${API_BASE_URL}/analytics/dataset-ml`, { params }),
  exportCSV: (params) => {
    return axios.get(`${API_BASE_URL}/analytics/export-csv`, {
      params,
      responseType: 'blob'
    });
  },
  saveReport: (data) => axios.post(`${API_BASE_URL}/analytics/save-report`, data),
  getRecentAnalytics: () => axios.get(`${API_BASE_URL}/analytics/recent`)
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
  studentAPI,
  analyticsAPI,
  downloadCSV
};
