import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "")
).replace(/\/+$/, "");

console.log("API_URL em uso:", API_URL || "/api");

const api = axios.create({
  baseURL: API_URL || "/api",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

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

  return config;
});

export default api;
export { api };