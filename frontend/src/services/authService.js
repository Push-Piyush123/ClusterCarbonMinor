import apiClient from "./apiClient";

const authService = {
  login: async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.user || {}));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("authToken");
  },

  registerCompany: async (formData) => {
    const res = await apiClient.post("/auth/register-company-full", formData);
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.company || {}));
    }
    return res.data;
  },

  registerMSME: async (formData) => {
    const res = await apiClient.post("/auth/register-msme-full", formData);
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.msme || {}));
    }
    return res.data;
  },

  registerAggregator: async (formData) => {
    const res = await apiClient.post("/auth/register-aggregator-full", formData);
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.aggregator || {}));
    }
    return res.data;
  },

  registerVerifier: async (formData) => {
    const res = await apiClient.post("/auth/register-verifier-full", formData);
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.verifier || {}));
    }
    return res.data;
  },

  registerAdmin: async (formData) => {
    const res = await apiClient.post("/auth/register-admin-full", formData);
    if (res.data && res.data.token) {
       localStorage.setItem("authToken", res.data.token);
       localStorage.setItem("user", JSON.stringify(res.data.admin || {}));
    }
    return res.data;
  }
};

export default authService;
