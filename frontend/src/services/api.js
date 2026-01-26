import axios from "axios";

// Normaliza baseURL (remove "/" no final e garante que existe)
const RAW_API_URL = import.meta.env.VITE_API_URL;

// fallback opcional (evita quebrar build se esquecer env)
const FALLBACK = "https://sistema-backend-czxj.onrender.com";

// garante que não fica undefined e remove "/" final
export const API_URL = (RAW_API_URL || FALLBACK).replace(/\/+$/, "");

/**
 * Helper usando fetch (para casos simples)
 */
export async function apiFetch(path, options = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_URL}${p}`;

  const headers = { ...(options.headers || {}) };

  // só seta Content-Type se tiver body e se não for FormData
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      (data && (data.detail || data.message)) || `Erro ${res.status} ao chamar ${p}`
    );
  }

  return data;
}

/**
 * Axios instance
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

// REQUEST interceptor (token + content-type correto)
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // Bearer token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ 1) Se for URLSearchParams, garantir form-urlencoded e converter pra string
    if (config.data instanceof URLSearchParams) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = config.data.toString();
      return config;
    }

    // ✅ 2) Se for FormData, NÃO setar Content-Type (browser seta o boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      return config;
    }

    // ✅ 3) Se for string (ex: já veio toString()), e não tem Content-Type, setar como form
    if (typeof config.data === "string" && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      return config;
    }

    // ✅ 4) Caso padrão: JSON
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

// RESPONSE interceptor (limpa token em 401/403)
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
