import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Link,
} from "@mui/material";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("❌ As senhas não coincidem!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("❌ A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/usuarios", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("✅ Conta criada com sucesso! Redirecionando para login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Erro no cadastro:", error?.response?.data || error);

      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 409) {
        setError("❌ Username ou email já existe!");
      } else if (status === 500) {
        setError("❌ Erro interno no servidor ao criar conta.");
      } else {
        setError(`❌ ${detail || "Erro ao criar conta! Tente novamente."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f4f6f8 0%, #e9eef5 100%)",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        boxSizing: "border-box",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: { xs: 0, sm: 2 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: 460,
            p: { xs: 2.2, sm: 4 },
            borderRadius: { xs: 2.5, sm: 3 },
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.08)",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: { xs: 2.5, sm: 3 } }}>
            <Typography
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.9rem", sm: "2.5rem" },
                lineHeight: 1.1,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
                width: "100%",
                mb: 1,
              }}
            >
              📝 Criar Conta
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.92rem", sm: "1rem" },
                lineHeight: 1.4,
              }}
            >
              Cadastre-se para acessar o sistema
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 2.2 },
            }}
          >
            <TextField
              label="Nome de Usuário"
              name="username"
              variant="outlined"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <TextField
              label="Senha"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              required
              helperText="Mínimo 6 caracteres"
            />

            <TextField
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: { xs: 1.2, sm: 1.35 },
                fontSize: { xs: "0.95rem", sm: "1rem" },
                fontWeight: 600,
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                boxShadow: 2,
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                  boxShadow: 3,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Criar Conta"}
            </Button>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{
                mt: 1,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                lineHeight: 1.5,
              }}
            >
              Já tem uma conta?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{
                  color: "#1976d2",
                  fontWeight: 600,
                }}
              >
                Fazer Login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;