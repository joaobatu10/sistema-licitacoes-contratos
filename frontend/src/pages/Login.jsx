import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new URLSearchParams();
      form.append("username", username.trim());
      form.append("password", password);

      // ✅ seu api.js já seta Content-Type e converte pra string
      const { data } = await api.post("/login", form);

      if (!data?.access_token) {
        throw new Error("Token não retornado pela API");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user || null));

      // ✅ SEM reload (pode ficar), mas teu App.jsx pode não atualizar sidebar/header.
      // Para garantir 100%, use reload:
      window.location.href = "/dashboard";
      // ou: navigate("/dashboard", { replace: true });

    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      console.error("Erro de login:", err?.response?.data || err);

      if (status === 401) {
        setError("❌ Usuário ou senha incorretos.");
      } else if (status === 422) {
        setError("❌ Dados inválidos (422). Confira usuário e senha.");
      } else if (status === 404) {
        setError("❌ Rota /login não encontrada no backend.");
      } else {
        setError(detail ? `❌ ${detail}` : "❌ Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url('/login-background.jpg')`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        m: 0,
        p: 0,
        boxSizing: "border-box",
        filter: "contrast(1.05) brightness(1.02) saturate(1.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 999,
          pointerEvents: "auto",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 420,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0 30px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            position: "relative",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background:
                  "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
                width: "100%",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                mb: 1,
              }}
            >
              🏢 SALC
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#666",
                fontWeight: 400,
                letterSpacing: 1.2,
              }}
            >
              Sistema de Licitações e Contratos
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              label="Usuário"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ borderRadius: 2, py: 2, fontWeight: 600 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Entrar"
              )}
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
              Não tem uma conta?{" "}
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Criar Conta
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
