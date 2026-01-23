import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from "@mui/material";
import { Dashboard, Description, Work, Notifications, People, Assessment, AccountBalance, GroupWork } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [notificacoes, setNotificacoes] = useState(0);

  const fetchNotificacoesCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const url = user.id 
        ? `http://127.0.0.1:8000/notificacoes/?usuario_id=${user.id}&apenas_nao_lidas=true`
        : "http://127.0.0.1:8000/notificacoes/?apenas_nao_lidas=true";
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    fetchNotificacoesCount();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotificacoesCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <ListItemText primary="SALC" sx={{ fontSize: "30px", fontWeight: "bold", color: "#fff" }} />
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
