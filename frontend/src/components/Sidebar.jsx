import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
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
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

const Sidebar = () => {
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
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#1E293B",
          color: "white",
        },
      }}
    >
      <List>
        <ListItem>
          <ListItemText
            primary="SALC"
            sx={{ fontSize: "30px", fontWeight: "bold", color: "#fff" }}
          />
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/dashboard">
            <ListItemIcon>
              <Dashboard sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/licitacoes">
            <ListItemIcon>
              <Description sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Licitações" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/gcalc">
            <ListItemIcon>
              <GroupWork sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="GCALC" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/contratos">
            <ListItemIcon>
              <Work sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Contratos" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/processos">
            <ListItemIcon>
              <AccountBalance sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Processos" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/usuarios">
            <ListItemIcon>
              <People sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Usuários" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/relatorios">
            <ListItemIcon>
              <Assessment sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Relatórios" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/notificacoes">
            <ListItemIcon>
              <Badge badgeContent={notificacoes} color="error">
                <Notifications sx={{ color: "white" }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notificações" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;