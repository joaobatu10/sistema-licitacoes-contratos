import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

console.log("API_URL em uso:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
export { api };