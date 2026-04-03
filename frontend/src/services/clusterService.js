import apiClient from './apiClient';
import { API_CONFIG } from '../config/api.config';

const clusterService = {
  getClusters: async (params = {}) => {
    const response = await apiClient.get('/clusters', { params });
    return response.data;
  },
  getClusterDetails: async (clusterId) => {
    const response = await apiClient.get(`/clusters/${clusterId}`);
    return response.data;
  },
  getClusterMetrics: async (clusterId) => {
    const response = await apiClient.get(`/clusters/${clusterId}/metrics`);
    return response.data;
  }
};

export default clusterService;
