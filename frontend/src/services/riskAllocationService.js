import apiClient from './apiClient';
import { API_CONFIG } from '../config/api.config';

const riskAllocationService = {
  // Calculate risk scores
  calculateRisks: async (clusterId, period, periodStart, periodEnd) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.RISK_CALCULATE,
      { clusterId, period, periodStart, periodEnd }
    );
    return response.data;
  },

  // Allocate credits
  allocateCredits: async (clusterId, period) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.RISK_ALLOCATE,
      { clusterId, period }
    );
    return response.data;
  },

  // Get cluster allocations
  getClusterAllocations: async (clusterId, params = {}) => {
    const endpoint = API_CONFIG.ENDPOINTS.RISK_GET_CLUSTER.replace(':clusterId', clusterId);
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // Get MSME allocations
  getMSMEAllocations: async (msmeId) => {
    const endpoint = API_CONFIG.ENDPOINTS.RISK_GET_MSME.replace(':msmeId', msmeId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Get allocations summary
  getAllocationsSummary: async (params = {}) => {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.RISK_GET_SUMMARY,
      { params }
    );
    return response.data;
  },

  // Get risk scores
  getRiskScores: async (clusterId, params = {}) => {
    const endpoint = API_CONFIG.ENDPOINTS.RISK_GET_RISK_SCORES.replace(':clusterId', clusterId);
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // Verify allocation
  verifyAllocation: async (allocationId, verified, verificationNotes) => {
    const endpoint = API_CONFIG.ENDPOINTS.RISK_VERIFY.replace(':allocationId', allocationId);
    const response = await apiClient.post(endpoint, { verified, verificationNotes });
    return response.data;
  },

  // Claim allocation
  claimAllocation: async (allocationId, companyId) => {
    const endpoint = API_CONFIG.ENDPOINTS.RISK_CLAIM.replace(':allocationId', allocationId);
    const response = await apiClient.post(endpoint, { companyId });
    return response.data;
  }
};

export default riskAllocationService;
