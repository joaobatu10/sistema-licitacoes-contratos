import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  Description,
  Work,
  Notifications,
  People,
  Assessment,
  AccountBalance,
  GroupWork,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

export const drawerWidth = 240;

const SidebarContent = ({ notificacoes, onItemClick }) => {
  const menuItems = [
    { text: "Dashboard", icon: <Dashboard sx={{ color: "white" }} />, to: "/dashboard" },
    { text: "Licitações", icon: <Description sx={{ color: "white" }} />, to: "/licitacoes" },
    { text: "GCALC", icon: <GroupWork sx={{ color: "white" }} />, to: "/gcalc" },
    { text: "Contratos", icon: <Work sx={{ color: "white" }} />, to: "/contratos" },
    { text: "Processos", icon: <AccountBalance sx={{ color: "white" }} />, to: "/processos" },
    { text: "Usuários", icon: <People sx={{ color: "white" }} />, to: "/usuarios" },
    { text: "Relatórios", icon: <Assessment sx={{ color: "white" }} />, to: "/relatorios" },
    {
      text: "Notificações",
      icon: (
        <Badge badgeContent={notificacoes} color="error">
          <Notifications sx={{ color: "white" }} />
        </Badge>
      ),
      to: "/notificacoes",
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#1E293B",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          SALC
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              onClick={onItemClick}
              sx={{
                borderRadius: 2,
                color: "#fff",
                "& .active": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                },
                "&.active": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                },
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onDrawerToggle, onDrawerClose }) => {
  const [notificacoes, setNotificacoes] = useState(0);
  const location = useLocation();

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const fetchNotificacoesCount = useCallback(async () => {
    try {
      const user = getCurrentUser();

      const response = await api.get("/notificacoes/", {
        params: {
          ...(user?.id ? { usuario_id: user.id } : {}),
          apenas_nao_lidas: true,
        },
      });

      const data = response?.data;
      setNotificacoes(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error?.response?.data || error);
      setNotificacoes(0);
    }
  }, []);

  useEffect(() => {
    fetchNotificacoesCount();

    const interval = setInterval(fetchNotificacoesCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificacoesCount]);

  useEffect(() => {
    fetchNotificacoesCount();
  }, [location.pathname, fetchNotificacoesCount]);

  return (
    <>
      <IconButton
        onClick={onDrawerToggle}
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1300,
          backgroundColor: "#1E293B",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#334155",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent
          notificacoes={notificacoes}
          onItemClick={onDrawerClose}
        />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1E293B",
            color: "white",
            border: "none",
          },
        }}
      >
        <SidebarContent notificacoes={notificacoes} />
      </Drawer>
    </>
  );
};

export default Sidebar;