import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://aquafineapp.onrender.com",
  timeout: 10000,
});

// Request Interceptor to dynamically inject the authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aquafine_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to intercept 401s and automatically clear local session
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("aquafine_admin_token");
      localStorage.removeItem("aquafine_admin_user");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await API.post("/api/admin/login", { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await API.get("/api/auth/me");
    return response.data;
  },
};

export const adminAPI = {
  getAnalytics: async () => {
    const response = await API.get("/api/admin/analytics");
    return response.data;
  },
  getOrders: async () => {
    const response = await API.get("/api/admin/orders");
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await API.put(`/api/admin/orders/${id}/status`, { status });
    return response.data;
  },
  getUsers: async () => {
    const response = await API.get("/api/admin/users");
    return response.data;
  },
  getPayments: async () => {
    const response = await API.get("/api/admin/payments");
    return response.data;
  },
};

export default API;
