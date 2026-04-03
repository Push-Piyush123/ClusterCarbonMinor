import apiClient from './apiClient';
import { API_CONFIG } from '../config/api.config';

const emissionService = {
  // Calculate emissions for cluster
  calculateEmissions: async (clusterId, period, periodStart, periodEnd, periodLabel) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.EMISSIONS_CALCULATE,
      { clusterId, period, periodStart, periodEnd, periodLabel }
    );
    return response.data;
  },

  // Get cluster emissions
  getClusterEmissions: async (clusterId, params = {}) => {
    const endpoint = API_CONFIG.ENDPOINTS.EMISSIONS_GET_CLUSTER.replace(':clusterId', clusterId);
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // Get MSME emissions
  getMSMEEmissions: async (msmeId) => {
    const endpoint = API_CONFIG.ENDPOINTS.EMISSIONS_GET_MSME.replace(':msmeId', msmeId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Get emissions summary
  getEmissionsSummary: async (params = {}) => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.EMISSIONS_GET_SUMMARY,
      { params }
    );
    return response.data;
  },

  // Issue emissions
  issueEmissions: async (clusterId, period) => {
    const endpoint = API_CONFIG.ENDPOINTS.EMISSIONS_ISSUE.replace(':clusterId', clusterId);
    const response = await apiClient.post(endpoint, { period });
    return response.data;
  },

  // Verify emission record
  verifyEmission: async (emissionSummaryId, verified, comments) => {
    const endpoint = API_CONFIG.ENDPOINTS.EMISSIONS_VERIFY.replace(':emissionSummaryId', emissionSummaryId);
    const response = await apiClient.post(endpoint, { verified, comments });
    return response.data;
  }
};

export default emissionService;
