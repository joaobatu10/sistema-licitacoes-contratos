import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData && userData !== "undefined" && userData !== "null") {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    const handleAuthChanged = () => loadUser();

    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar
        sx={{
          minHeight: { xs: "auto", sm: 64 },
          py: { xs: 1.2, sm: 1 },
          px: { xs: 2, sm: 3 },
          pl: { xs: 8, sm: 9, md: 3 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            lineHeight: 1.3,
            width: "100%",
            pr: { xs: 0, sm: 2 },
            wordBreak: "break-word",
          }}
        >
          Sistema de Monitoramento de Licitações e Contratos
        </Typography>

        {user ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
              alignItems: "center",
              justifyContent: { xs: "space-between", sm: "flex-end" },
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                whiteSpace: "nowrap",
              }}
            >
              Olá, {user.username}!
            </Typography>

            <Button
              color="inherit"
              onClick={handleLogout}
              size="small"
              sx={{
                minWidth: "auto",
                px: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              flexWrap: "wrap",
            }}
          >
            <Button
              color="inherit"
              onClick={handleLogin}
              size="small"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={handleRegister}
              size="small"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Criar Conta
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;