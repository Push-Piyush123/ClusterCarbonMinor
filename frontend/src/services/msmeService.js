import apiClient from "./apiClient";

const msmeService = {
  getBaselineAverage: async (msmeId) => {
      const res = await apiClient.get(`/msmes/${msmeId}/baseline-average`);
      return res.data;
  },

  getEmissionStatus: async (msmeId) => {
      const res = await apiClient.get(`/msmes/${msmeId}/emission-status`);
      return res.data;
  },

  submitBaseline: async (msmeId, formData) => {
      const res = await apiClient.post(`/msmes/${msmeId}/baseline-reading`, formData);
      return res.data;
  }
};

export default msmeService;
