import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { api } from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const form = new URLSearchParams();
      form.append("username", username.trim());
      form.append("password", password);

      const response = await api.post("/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = response?.data;

      if (!data?.access_token) {
        throw new Error("Token não retornado.");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user || null));
      window.dispatchEvent(new Event("auth-changed"));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erro de login:", err?.response?.data || err);

      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 401) {
        setError("❌ Usuário ou senha incorretos.");
      } else if (status === 403) {
        setError(`❌ ${detail || "Acesso negado."}`);
      } else if (status === 500) {
        setError("❌ Erro interno no servidor ao tentar fazer login.");
      } else {
        setError(`❌ ${detail || err?.message || "Erro ao fazer login."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/login-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 4 },
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.22)",
        },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: { xs: 360, sm: 440 },
          p: { xs: 2.2, sm: 4 },
          borderRadius: 3,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "2.1rem", sm: "2.8rem" },
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "inline-block",
              mb: 1,
            }}
          >
            SALC
          </Typography>

          <Typography
            sx={{
              color: "#666",
              fontSize: { xs: "0.92rem", sm: "1rem" },
              lineHeight: 1.4,
            }}
          >
            Sistema de Monitoramento de Licitações e Contratos
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
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.25,
              fontSize: { xs: "0.95rem", sm: "1rem" },
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              lineHeight: 1.5,
            }}
          >
            Não tem uma conta?{" "}
            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{
                color: "#1976d2",
                fontWeight: 600,
              }}
            >
              Criar Conta
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;