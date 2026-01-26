import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, Container, CircularProgress } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Licitacoes from "./pages/Licitacoes";
import GCALC from "./pages/GCALC";
import Contratos from "./pages/Contratos";
import Processos from "./pages/Processos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Usuarios from "./pages/Usuarios";
import Notificacoes from "./pages/Notificacoes";
import Relatorios from "./pages/Relatorios";
import CadastroLicitacao from "./pages/CadastroLicitacao";
import CadastroLicitacaoSimples from "./pages/CadastroLicitacaoSimples";
import TesteDebug from "./pages/TesteDebug";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const ok = token && token !== "undefined" && token !== "null" && token.trim() !== "";
    setIsAuthenticated(!!ok);
  };

  useEffect(() => {
    checkAuthStatus();

    const onAuthChanged = () => checkAuthStatus();
    const onStorage = () => checkAuthStatus();

    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // atualiza também quando mudar rota
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <Box sx={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {isAuthenticated && <Sidebar />}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isAuthenticated && <Header />}

        <Container component="main" sx={{ flex: 1, p: 3, bgcolor: "transparent" }}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
            />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/licitacoes" element={<ProtectedRoute><Licitacoes /></ProtectedRoute>} />
            <Route path="/gcalc" element={<ProtectedRoute><GCALC /></ProtectedRoute>} />
            <Route path="/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
            <Route path="/processos" element={<ProtectedRoute><Processos /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
            <Route path="/cadastro-licitacao" element={<ProtectedRoute><CadastroLicitacao /></ProtectedRoute>} />

            <Route path="/cadastro-simples" element={<CadastroLicitacaoSimples />} />
            <Route path="/debug" element={<TesteDebug />} />

            {/* rota coringa */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
