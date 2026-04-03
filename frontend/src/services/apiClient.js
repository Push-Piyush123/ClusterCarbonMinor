import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally by forcing logout unless we are trying to login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Generic fallback handler for broader errors
    if (error.response) {
      if (error.response.status === 403) {
        console.error('Forbidden action blocked natively:', error.response.data);
      } else if (error.response.status >= 500) {
        console.error('Core Backend Server Fault:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response from backend server. Network fault?', error.request);
    }

    return Promise.reject(error);
  }
);


export default apiClient;
