import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Notifications,
  NotificationsActive,
  Check,
  Delete,
  MarkEmailRead,
  Refresh,
} from "@mui/icons-material";
import api from "../services/api";

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getCurrentUser();
      const userId = user?.id;

      const response = await api.get("/notificacoes/", {
        params: userId ? { usuario_id: userId } : {},
      });

      setNotificacoes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error?.response?.data || error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setError("Erro ao buscar notificações.");
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/marcar-lida`);

      setNotificacoes((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? { ...notif, lida: true, data_leitura: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error?.response?.data || error);
      alert("Erro ao marcar notificação como lida.");
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const user = getCurrentUser();
      const userId = user?.id;

      await api.patch("/notificacoes/marcar-todas-lidas", null, {
        params: userId ? { usuario_id: userId } : {},
      });

      setNotificacoes((prev) =>
        prev.map((notif) => ({
          ...notif,
          lida: true,
          data_leitura: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error?.response?.data || error);
      alert("Erro ao marcar todas as notificações como lidas.");
    }
  };

  const deletarNotificacao = async (id) => {
    if (!id) return;

    try {
      await api.delete(`/notificacoes/${id}`);
      setNotificacoes((prev) => prev.filter((notif) => notif.id !== id));
      setOpenDialog(false);
      setSelectedNotif(null);
    } catch (error) {
      console.error("Erro ao deletar notificação:", error?.response?.data || error);
      alert("Erro ao deletar notificação.");
    }
  };

  const getCorTipo = (tipo) => {
    const cores = {
      info: "primary",
      success: "success",
      warning: "warning",
      error: "error",
    };
    return cores[tipo] || "default";
  };

  const getIconeTipo = (tipo) => {
    const icones = {
      info: "📋",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };
    return icones[tipo] || "📢";
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Badge badgeContent={naoLidas} color="error">
            <Notifications sx={{ fontSize: 32, color: "primary.main" }} />
          </Badge>
          <Typography variant="h4" component="h1">
            Notificações
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={fetchNotificacoes} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>

          {naoLidas > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkEmailRead />}
              onClick={marcarTodasComoLidas}
              size="small"
            >
              Marcar Todas como Lidas
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Alert severity="info" sx={{ flex: 1 }}>
          <strong>{notificacoes.length}</strong> notificações totais
        </Alert>

        {naoLidas > 0 && (
          <Alert severity="warning" sx={{ flex: 1 }}>
            <strong>{naoLidas}</strong> não lidas
          </Alert>
        )}
      </Box>

      {notificacoes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Notifications sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Nenhuma notificação encontrada
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {notificacoes.map((notificacao, index) => (
            <React.Fragment key={notificacao.id}>
              <ListItem
                sx={{
                  bgcolor: notificacao.lida ? "background.paper" : "action.hover",
                  borderRadius: 1,
                  mb: 1,
                  border: 1,
                  borderColor: notificacao.lida ? "divider" : "primary.light",
                }}
              >
                <Card sx={{ width: "100%", boxShadow: "none" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ fontSize: "1.2em" }}>
                            {getIconeTipo(notificacao.tipo)}
                          </Typography>

                          <Typography variant="h6" component="h3">
                            {notificacao.titulo}
                          </Typography>

                          <Chip
                            label={(notificacao.tipo || "info").toUpperCase()}
                            color={getCorTipo(notificacao.tipo)}
                            size="small"
                          />

                          {!notificacao.lida && (
                            <Chip
                              label="NOVA"
                              color="error"
                              size="small"
                              icon={<NotificationsActive />}
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {notificacao.mensagem}
                        </Typography>

                        <Typography variant="caption" color="textSecondary">
                          {notificacao.data_criacao
                            ? new Date(notificacao.data_criacao).toLocaleString("pt-BR")
                            : "Data não informada"}
                          {notificacao.lida && notificacao.data_leitura && (
                            <span>
                              {" "}
                              • Lida em {new Date(notificacao.data_leitura).toLocaleString("pt-BR")}
                            </span>
                          )}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 2 }}>
                        {!notificacao.lida && (
                          <Tooltip title="Marcar como lida">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => marcarComoLida(notificacao.id)}
                            >
                              <Check />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedNotif(notificacao);
                              setOpenDialog(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>

              {index < notificacoes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar a notificação "{selectedNotif?.titulo}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => deletarNotificacao(selectedNotif?.id)}
            variant="contained"
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notificacoes;