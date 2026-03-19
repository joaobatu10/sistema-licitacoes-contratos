import axios from "axios";

const RAW_API_URL = import.meta.env.VITE_API_URL;
export const API_URL = (RAW_API_URL || "").replace(/\/+$/, "");

console.log("API_URL em uso:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    if (!config.headers.Accept) {
      config.headers.Accept = "application/json";
    }

    const url = config.url || "";
    const path = url.startsWith("http")
      ? new URL(url).pathname
      : url.startsWith("/")
        ? url
        : `/${url}`;

    const isAuthRoute =
      path === "/login" ||
      path.startsWith("/login/") ||
      path === "/register" ||
      path.startsWith("/register/");

    if (!isAuthRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers.Authorization;
    }

    if (config.data instanceof URLSearchParams) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = config.data.toString();
      return config;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      return config;
    }

    if (
      config.data &&
      typeof config.data === "object" &&
      !config.headers["Content-Type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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