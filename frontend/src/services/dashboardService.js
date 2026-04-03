import apiClient from './apiClient';
import { API_CONFIG } from '../config/api.config';

const dashboardService = {
  // Get system metrics
  getSystemMetrics: async () => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.DASHBOARD_SYSTEM_METRICS
    );
    return response.data;
  },

  // Get cluster dashboard
  getClusterDashboard: async (clusterId, params = {}) => {
    const endpoint = API_CONFIG.ENDPOINTS.DASHBOARD_CLUSTER.replace(':clusterId', clusterId);
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // Get MSME dashboard
  getMSMEDashboard: async (msmeId) => {
    const endpoint = API_CONFIG.ENDPOINTS.DASHBOARD_MSME.replace(':msmeId', msmeId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Get verification queue
  getVerificationQueue: async (params = {}) => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.DASHBOARD_VERIFICATION_QUEUE,
      { params }
    );
    return response.data;
  },

  // Export to CSV fixing raw window.location logic via Blob streams
  exportCSV: async (type, clusterId = null, msmeId = null) => {
    const params = { type };
    if (clusterId) params.clusterId = clusterId;
    if (msmeId) params.msmeId = msmeId;

    try {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD_EXPORT_CSV, {
            params,
            responseType: 'blob' // Force axios to trace the stream natively
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        console.error("Export failure", e);
    }
  },

  // Export to PDF fixing raw window.location logic via Blob buffers
  exportPDF: async (type, clusterId = null, msmeId = null) => {
    const params = { type };
    if (clusterId) params.clusterId = clusterId;
    if (msmeId) params.msmeId = msmeId;

    try {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD_EXPORT_PDF, {
            params,
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        console.error("Export failure", e);
    }
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.DASHBOARD_SUMMARY
    );
    return response.data;
  },

  // Get data quality
  getDataQuality: async () => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.DASHBOARD_DATA_QUALITY
    );
    return response.data;
  }
};

export default dashboardService;
