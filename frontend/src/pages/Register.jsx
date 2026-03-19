import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api"
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validações
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
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        setSuccess("✅ Conta criada com sucesso! Redirecionando para login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError("❌ Username ou email já existe!");
      } else {
        setError("❌ Erro ao criar conta! Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f4f6f8"
      }}
    >
      <Paper elevation={0} sx={{ 
        padding: 4, 
        width: "100%", 
        maxWidth: 400,
        borderRadius: 3,
        boxShadow: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold" sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
          width: '100%'
        }}>
          📝 Criar Conta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            color="primary" 
            fullWidth 
            disabled={loading}
            sx={{ 
              mt: 2,
              borderRadius: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: 3,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Criar Conta"}
          </Button>
          
          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Já tem uma conta?{" "}
            <Link to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
              Fazer Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;