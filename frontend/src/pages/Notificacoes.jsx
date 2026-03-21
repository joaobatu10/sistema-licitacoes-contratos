import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Notifications,
  NotificationsActive,
  Check,
  Delete,
  MarkEmailRead,
  Refresh,
  Close,
} from "@mui/icons-material";
import api from "../services/api";

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const formatarData = (data) => {
    if (!data) return "Data não informada";
    return new Date(data).toLocaleString("pt-BR");
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Badge badgeContent={naoLidas} color="error">
            <Notifications sx={{ fontSize: { xs: 30, sm: 34 }, color: "primary.main" }} />
          </Badge>

          <Box>
            <Typography
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.2rem" },
                color: "primary.main",
                lineHeight: 1.1,
              }}
            >
              Notificações
            </Typography>

            <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
              Acompanhe avisos, atualizações e alertas do sistema.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchNotificacoes}
            fullWidth={isMobile}
          >
            Atualizar
          </Button>

          {naoLidas > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkEmailRead />}
              onClick={marcarTodasComoLidas}
              fullWidth={isMobile}
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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Alert severity="info" sx={{ flex: 1 }}>
          <strong>{notificacoes.length}</strong> notificações totais
        </Alert>

        <Alert severity={naoLidas > 0 ? "warning" : "success"} sx={{ flex: 1 }}>
          <strong>{naoLidas}</strong> não lidas
        </Alert>
      </Stack>

      {notificacoes.length === 0 ? (
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Notifications sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhuma notificação encontrada
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {notificacoes.map((notificacao) => (
            <Card
              key={notificacao.id}
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                border: 1,
                borderColor: notificacao.lida ? "divider" : "primary.light",
                backgroundColor: notificacao.lida ? "#fff" : "rgba(25, 118, 210, 0.04)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "flex-start" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>
                        {getIconeTipo(notificacao.tipo)}
                      </Typography>

                      <Typography
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          wordBreak: "break-word",
                        }}
                      >
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

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5, wordBreak: "break-word" }}
                    >
                      {notificacao.mensagem}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatarData(notificacao.data_criacao)}
                    </Typography>

                    {notificacao.lida && notificacao.data_leitura && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Lida em {formatarData(notificacao.data_leitura)}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "row", sm: "column" },
                      justifyContent: { xs: "flex-end", sm: "flex-start" },
                      gap: 1,
                      alignSelf: { xs: "stretch", sm: "auto" },
                    }}
                  >
                    {!notificacao.lida && (
                      <Tooltip title="Marcar como lida">
                        <IconButton
                          color="primary"
                          onClick={() => marcarComoLida(notificacao.id)}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <Check />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Deletar">
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedNotif(notificacao);
                          setOpenDialog(true);
                        }}
                        sx={{ border: "1px solid", borderColor: "divider" }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Confirmar Exclusão
          <IconButton onClick={() => setOpenDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar a notificação "{selectedNotif?.titulo}"?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={() => setOpenDialog(false)} fullWidth={isMobile}>
            Cancelar
          </Button>

          <Button
            color="error"
            onClick={() => deletarNotificacao(selectedNotif?.id)}
            variant="contained"
            fullWidth={isMobile}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notificacoes;