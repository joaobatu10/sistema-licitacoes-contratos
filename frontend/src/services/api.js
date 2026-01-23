import axios from "axios";



export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});


// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("🔑 Interceptor - Token encontrado:", token ? "SIM" : "NÃO");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🚀 Interceptor - Authorization header adicionado");
    } else {
      console.log("⚠️ Interceptor - Nenhum token para adicionar");
    }
    console.log("📤 Interceptor - Configuração final:", {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error("❌ Interceptor Request - Erro:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log("✅ Interceptor Response - Sucesso:", {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error("❌ Interceptor Response - Erro:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 500) {
      // Token inválido, expirado, sem permissão ou erro de formato
      console.log("🔧 Erro de autenticação detectado, limpando localStorage...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirecionar para login se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        alert("Sessão expirada ou sem permissão. Faça login novamente.");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
