import axios from "axios";

// Base URL (sem barra no final)
const RAW_API_URL = import.meta.env.VITE_API_URL;
const FALLBACK = "https://sistema-backend-czxj.onrender.com";
export const API_URL = (RAW_API_URL || FALLBACK).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Render pode "acordar" e demorar
});

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const url = config.url || "";

    // ✅ NÃO enviar token no login/register
    const isAuthRoute = url.includes("/login") || url.includes("/register");

    if (!isAuthRoute) {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ URLSearchParams -> x-www-form-urlencoded
    if (config.data instanceof URLSearchParams) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = config.data.toString();
      return config;
    }

    // ✅ FormData -> não setar Content-Type (browser seta boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      return config;
    }

    // ✅ objeto normal -> JSON
    if (config.data && typeof config.data === "object" && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
