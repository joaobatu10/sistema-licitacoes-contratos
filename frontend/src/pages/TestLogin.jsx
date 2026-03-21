import { useState } from "react";
import { Button, TextField, Box, Typography, Alert, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const TestLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const testLogin = async () => {
    setResult("");
    setError("");

    try {
      console.log("Testando login...");

      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      console.log("Enviando para /login");
      console.log("Dados:", { username, password });

      const response = await api.post("/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Resposta:", response.data);

      const data = response.data;

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-changed"));

        setResult("✅ Login bem-sucedido! Token salvo. Redirecionando...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError("Resposta inválida do servidor.");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError(
        `Erro: ${
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message
        }`
      );
    }
  };

  const clearStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setResult("LocalStorage limpo");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Login
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={testLogin}>
          Testar Login
        </Button>

        <Button variant="outlined" onClick={clearStorage}>
          Limpar LocalStorage
        </Button>

        {result && <Alert severity="success">{result}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="h6" sx={{ mt: 2 }}>
          Debug Info:
        </Typography>

        <Typography variant="body2">
          Token atual: {localStorage.getItem("token") ? "Existe" : "Não existe"}
        </Typography>

        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
          User atual: {localStorage.getItem("user") || "Não existe"}
        </Typography>
      </Box>
    </Container>
  );
};

export default TestLogin;