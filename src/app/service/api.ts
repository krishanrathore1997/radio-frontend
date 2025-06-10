// lib/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor: Add token to headers
if (typeof window !== "undefined") {
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ✅ Response Interceptor: Handle token expiry
  API.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // 🔄 Redirect to login
      }
      return Promise.reject(error);
    }
  );
}

export default API;
