import React, { useState, useEffect } from "react";
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

  // ⚠️ NÃO mexa no DOM global em produção
  // Se precisar layout fullscreen, faça com CSS

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const response = await api.post("/login", params);

      if (!response?.data?.access_token) {
        throw new Error("Token não retornado");
      }

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ navegação correta
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Erro de login:", err);
      setError("❌ Erro ao fazer login! Verifique suas credenciais.");
      return; // ⬅️ evita crash
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
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        m: 0,
        p: 0,
        boxSizing: 'border-box',
        filter: 'contrast(1.05) brightness(1.02) saturate(1.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1
        }
      }}
    >
      
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: 'relative',
          zIndex: 999,
          pointerEvents: 'auto'
        }}
      >
        <Paper elevation={12} sx={{ 
          padding: 4, 
          width: "100%", 
          maxWidth: 420,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" fontWeight="bold" sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
            width: '100%',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 1
          }}>
            🏢 SALC
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#666',
            fontWeight: 400,
            letterSpacing: 1.2
          }}>
            Sistema de Licitações e Contratos
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: 'rgba(25, 118, 210, 0.3)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: '#1976d2',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                }
              }
            }}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: 'rgba(25, 118, 210, 0.3)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: '#1976d2',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                }
              }
            }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{
            borderRadius: 2,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              boxShadow: '0 12px 25px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
            },
            transition: 'all 0.3s ease',
            mt: 1
          }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
          
          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Não tem uma conta?{" "}
            <Link to="/register" style={{ textDecoration: "none", color: "#1976d2" }}>
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
