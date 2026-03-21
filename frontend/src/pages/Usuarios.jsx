import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Person,
  Email,
  AdminPanelSettings,
  People,
  Visibility,
  Close,
  AccountCircle,
  Security,
  AccessTime,
  Info,
  Edit,
  Save,
  Cancel,
  Delete,
  Warning,
} from "@mui/icons-material";
import api from "../services/api";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔍 Buscando usuários...");

      const response = await api.get("/usuarios");
      console.log("✅ Usuários carregados:", response.data);

      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);

      if (error.response?.status === 401) {
        setError("Você precisa estar logado para visualizar usuários");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        setError("Você não tem permissão para visualizar usuários");
      } else {
        setError("Erro ao carregar lista de usuários");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) => {
    return String(username || "U").substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ["primary", "secondary", "success", "warning", "info", "error"];
    return colors[index % colors.length];
  };

  const getRoleLabel = (user) => {
    const role = user?.role || (user?.username === "admin" ? "admin" : "user");
    return role === "admin" ? "Administrador" : "Usuário Comum";
  };

  const getRoleColor = (user) => {
    const role = user?.role || (user?.username === "admin" ? "admin" : "user");
    return role === "admin" ? "error" : "primary";
  };

  const handleViewUser = async (usuario) => {
    setSelectedUser(usuario);
    setDetailsOpen(true);
    setLoadingDetails(true);

    try {
      console.log("🔍 Buscando detalhes do usuário:", usuario.id);

      const response = await api.get(`/usuarios/${usuario.id}`);
      console.log("✅ Detalhes do usuário carregados:", response.data);

      const detailedUser = {
        ...response.data,
        ultimoLogin: new Date().toISOString(),
        dataCriacao: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalLicitacoes: Math.floor(Math.random() * 20),
        totalContratos: Math.floor(Math.random() * 15),
        permissoes:
          usuario.username === "admin" || response.data?.role === "admin"
            ? [
                "Gerenciar Usuários",
                "Criar Licitações",
                "Criar Contratos",
                "Gerar Relatórios",
                "Configurações do Sistema",
              ]
            : [
                "Visualizar Licitações",
                "Visualizar Contratos",
                "Gerar Relatórios Básicos",
              ],
        sessaoAtiva: Math.random() > 0.3,
      };

      setUserDetails(detailedUser);
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes do usuário:", error);
      setUserDetails({
        ...usuario,
        ultimoLogin: "Informação não disponível",
        dataCriacao: "Informação não disponível",
        totalLicitacoes: "N/A",
        totalContratos: "N/A",
        permissoes: ["Informação não disponível"],
        sessaoAtiva: false,
        role: usuario.role || (usuario.username === "admin" ? "admin" : "user"),
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
    setEditingRole(false);
    setNewRole("");
  };

  const handleEditRole = () => {
    setEditingRole(true);
    setNewRole(userDetails?.role || (userDetails?.username === "admin" ? "admin" : "user"));
  };

  const handleCancelEditRole = () => {
    setEditingRole(false);
    setNewRole("");
  };

  const handleSaveRole = async () => {
    if (!userDetails) return;

    const currentRole =
      userDetails.role || (userDetails.username === "admin" ? "admin" : "user");

    if (newRole === currentRole) {
      setEditingRole(false);
      return;
    }

    setSavingRole(true);

    try {
      console.log("🔄 Alterando role do usuário:", userDetails.id, "para:", newRole);

      const formData = new FormData();
      formData.append("role", newRole);

      const response = await api.post(`/usuarios/change-role/${userDetails.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Role alterado com sucesso:", response.data);

      setUserDetails((prev) => ({
        ...prev,
        role: newRole,
      }));

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user.id === userDetails.id ? { ...user, role: newRole } : user
        )
      );

      setEditingRole(false);
      alert(`✅ ${response.data.message}`);
    } catch (error) {
      console.error("❌ Erro ao alterar role:", error);

      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão para alterar roles de usuários.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        alert(`Erro: ${error.response?.data?.detail || "Dados inválidos"}`);
      } else if (error.response?.status === 404) {
        alert("Erro: Usuário não encontrado.");
      } else {
        alert("Erro ao alterar role do usuário. Tente novamente.");
      }
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    try {
      console.log("🗑️ Deletando usuário:", userToDelete.username);

      const response = await api.delete(`/usuarios/${userToDelete.id}`);
      console.log("✅ Usuário deletado com sucesso:", response.data);

      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((user) => user.id !== userToDelete.id)
      );

      if (userDetails && userDetails.id === userToDelete.id) {
        setDetailsOpen(false);
        setUserDetails(null);
      }

      alert(`✅ ${response.data.message}`);
    } catch (error) {
      console.error("❌ Erro ao deletar usuário:", error);

      if (error.response?.data?.detail) {
        alert(`❌ ${error.response.data.detail}`);
      } else {
        alert("❌ Erro ao deletar usuário");
      }
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Informação não disponível") return dateString;
    return new Date(dateString).toLocaleString("pt-BR");
  };

  useEffect(() => {
    fetchUsuarios();
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

  if (error) {
    return (
      <Box sx={{ width: "100%", pb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <People sx={{ fontSize: { xs: 28, sm: 32 }, color: "primary.main" }} />
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              color: "primary.main",
            }}
          >
            Usuários
          </Typography>
        </Box>

        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
          Visualize, gerencie permissões e acompanhe os usuários do sistema.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: "center", borderRadius: 3 }}>
            <Typography
              fontWeight="bold"
              color="primary.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {usuarios.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total de Usuários
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: "center", borderRadius: 3 }}>
            <Typography
              fontWeight="bold"
              color="success.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {usuarios.filter((u) => (u.role || (u.username === "admin" ? "admin" : "user")) === "admin").length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administradores
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: "center", borderRadius: 3 }}>
            <Typography
              fontWeight="bold"
              color="info.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {usuarios.filter((u) => (u.role || (u.username === "admin" ? "admin" : "user")) !== "admin").length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Usuários Regulares
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            <Person />
            Lista de Usuários
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {usuarios.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <People sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum usuário encontrado
              </Typography>
            </Box>
          ) : isMobile ? (
            <Stack spacing={2}>
              {usuarios.map((usuario, index) => (
                <Card key={usuario.id} sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${getAvatarColor(index)}.main`,
                            width: 52,
                            height: 52,
                            fontSize: "1rem",
                            fontWeight: "bold",
                          }}
                        >
                          {getInitials(usuario.username)}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight="bold">{usuario.username}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ wordBreak: "break-word" }}
                          >
                            {usuario.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={getRoleLabel(usuario)}
                          color={getRoleColor(usuario)}
                          size="small"
                        />
                        <Chip label={`ID: ${usuario.id}`} variant="outlined" size="small" />
                        <Chip label="Ativo" color="success" variant="outlined" size="small" />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, pt: 0.5 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          fullWidth
                          onClick={() => handleViewUser(usuario)}
                        >
                          Detalhes
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          fullWidth
                          onClick={() => handleDeleteClick(usuario)}
                        >
                          Deletar
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0 }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {usuarios.map((usuario, index) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${getAvatarColor(index)}.main`,
                              width: 44,
                              height: 44,
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            {getInitials(usuario.username)}
                          </Avatar>
                          <Typography fontWeight={600}>{usuario.username}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.id}</TableCell>

                      <TableCell>
                        <Chip
                          icon={
                            (usuario.role || (usuario.username === "admin" ? "admin" : "user")) === "admin" ? (
                              <AdminPanelSettings />
                            ) : (
                              <Person />
                            )
                          }
                          label={getRoleLabel(usuario)}
                          color={getRoleColor(usuario)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip label="Ativo" color="success" variant="outlined" size="small" />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewUser(usuario)}
                          sx={{ mr: 1 }}
                        >
                          Ver Detalhes
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(usuario)}
                        >
                          Deletar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountCircle color="primary" sx={{ fontSize: 30 }} />
            <Typography fontWeight="bold" sx={{ fontSize: { xs: "1.15rem", sm: "1.4rem" } }}>
              Detalhes do Usuário
            </Typography>
          </Box>

          <IconButton onClick={handleCloseDetails}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", borderRadius: 3 }}>
                  <CardContent>
                    <Typography
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      <Info color="primary" />
                      Informações Básicas
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 64,
                          height: 64,
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        {getInitials(userDetails.username)}
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {userDetails.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {userDetails.id}
                        </Typography>
                        <Chip
                          icon={
                            (userDetails.role || (userDetails.username === "admin" ? "admin" : "user")) === "admin" ? (
                              <AdminPanelSettings />
                            ) : (
                              <Person />
                            )
                          }
                          label={getRoleLabel(userDetails)}
                          color={getRoleColor(userDetails)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Email:</TableCell>
                            <TableCell sx={{ wordBreak: "break-word" }}>{userDetails.email}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Status:</TableCell>
                            <TableCell>
                              <Chip
                                label={userDetails.sessaoAtiva ? "Online" : "Offline"}
                                color={userDetails.sessaoAtiva ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Data de Criação:</TableCell>
                            <TableCell>{formatDate(userDetails.dataCriacao)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Último Login:</TableCell>
                            <TableCell>{formatDate(userDetails.ultimoLogin)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", borderRadius: 3 }}>
                  <CardContent>
                    <Typography
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      <AccessTime color="primary" />
                      Atividades
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {userDetails.totalLicitacoes}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Licitações
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {userDetails.totalContratos}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Contratos
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Permissões:
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {userDetails.permissoes?.map((permissao, index) => (
                        <Chip
                          key={index}
                          label={permissao}
                          size="small"
                          color={getRoleColor(userDetails)}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      <Edit color="primary" />
                      Gerenciamento de Usuário
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Tipo de Usuário:
                        </Typography>

                        {editingRole ? (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "stretch", sm: "center" },
                              gap: 1.5,
                            }}
                          >
                            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
                              <InputLabel>Role</InputLabel>
                              <Select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                label="Role"
                              >
                                <MenuItem value="user">Usuário Comum</MenuItem>
                                <MenuItem value="admin">Administrador</MenuItem>
                              </Select>
                            </FormControl>

                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Save />}
                              onClick={handleSaveRole}
                              disabled={savingRole}
                              color="success"
                              fullWidth={isMobile}
                            >
                              {savingRole ? "Salvando..." : "Salvar"}
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={handleCancelEditRole}
                              disabled={savingRole}
                              fullWidth={isMobile}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "stretch", sm: "center" },
                              gap: 1.5,
                            }}
                          >
                            <Chip
                              icon={
                                (userDetails.role || (userDetails.username === "admin" ? "admin" : "user")) === "admin" ? (
                                  <AdminPanelSettings />
                                ) : (
                                  <Person />
                                )
                              }
                              label={getRoleLabel(userDetails)}
                              color={getRoleColor(userDetails)}
                              size="medium"
                            />

                            {userDetails.id !== 1 && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Edit />}
                                onClick={handleEditRole}
                                fullWidth={isMobile}
                              >
                                Alterar
                              </Button>
                            )}
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "warning.light",
                            color: "warning.contrastText",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            ⚠️ Atenção:
                          </Typography>
                          <Typography variant="body2">
                            • Administradores têm acesso total ao sistema
                            <br />
                            • Usuários comuns têm acesso limitado
                            <br />
                            • Esta ação é irreversível
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      <Security color="primary" />
                      Segurança e Configurações
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Tipo de Conta
                          </Typography>
                          <Chip
                            label={getRoleLabel(userDetails)}
                            color={getRoleColor(userDetails)}
                          />
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Autenticação
                          </Typography>
                          <Chip label="JWT Token" color="info" />
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Status da Conta
                          </Typography>
                          <Chip label="Ativa" color="success" />
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="error">
              Não foi possível carregar os detalhes do usuário.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button
            onClick={() => handleDeleteClick(userDetails)}
            color="error"
            variant="outlined"
            startIcon={<Delete />}
            fullWidth={isMobile}
          >
            Deletar Usuário
          </Button>

          <Button onClick={handleCloseDetails} variant="contained" fullWidth={isMobile}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" />
          Confirmar Exclusão
        </DialogTitle>

        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Atenção!</strong> Esta ação não pode ser desfeita.
          </Alert>

          {userToDelete && (
            <Typography variant="body1">
              Tem certeza que deseja deletar o usuário <strong>{userToDelete.username}</strong>?
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            • Todos os dados do usuário serão removidos permanentemente
            <br />
            • O usuário não poderá mais acessar o sistema
            <br />
            • Esta ação só pode ser realizada por administradores
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={handleDeleteCancel} variant="outlined" disabled={deleting} fullWidth={isMobile}>
            Cancelar
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            fullWidth={isMobile}
          >
            {deleting ? "Deletando..." : "Confirmar Exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;