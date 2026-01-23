import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
} from "@mui/material";
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

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando usuários...");
      
      // Usar api.js que tem os interceptors configurados
      const response = await api.get("/usuarios/");
      
      console.log("✅ Usuários carregados:", response.data);
      
      setUsuarios(response.data);
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      
      if (error.response?.status === 401) {
        setError("Você precisa estar logado para visualizar usuários");
        localStorage.removeItem('token');
        window.location.href = '/login';
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
    return username.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
    return colors[index % colors.length];
  };

  const handleViewUser = async (usuario) => {
    setSelectedUser(usuario);
    setDetailsOpen(true);
    setLoadingDetails(true);
    
    try {
      console.log("🔍 Buscando detalhes do usuário:", usuario.id);
      
      // Buscar detalhes específicos do usuário
      const response = await api.get(`/usuarios/${usuario.id}`);
      
      console.log("✅ Detalhes do usuário carregados:", response.data);
      
      // Simular dados adicionais para demonstração
      const detailedUser = {
        ...response.data,
        ultimoLogin: new Date().toISOString(),
        dataCriacao: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalLicitacoes: Math.floor(Math.random() * 20),
        totalContratos: Math.floor(Math.random() * 15),
        permissoes: usuario.username === 'admin' ? 
          ['Gerenciar Usuários', 'Criar Licitações', 'Criar Contratos', 'Gerar Relatórios', 'Configurações do Sistema'] :
          ['Visualizar Licitações', 'Visualizar Contratos', 'Gerar Relatórios Básicos'],
        sessaoAtiva: Math.random() > 0.3
      };
      
      setUserDetails(detailedUser);
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes do usuário:", error);
      setUserDetails({
        ...usuario,
        ultimoLogin: 'Informação não disponível',
        dataCriacao: 'Informação não disponível',
        totalLicitacoes: 'N/A',
        totalContratos: 'N/A',
        permissoes: ['Informação não disponível'],
        sessaoAtiva: false
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
    setNewRole(userDetails.role || 'user');
  };

  const handleCancelEditRole = () => {
    setEditingRole(false);
    setNewRole("");
  };

  const handleSaveRole = async () => {
    if (newRole === userDetails.role) {
      setEditingRole(false);
      return;
    }

    setSavingRole(true);
    try {
      console.log("🔄 Alterando role do usuário:", userDetails.id, "para:", newRole);
      
      const formData = new FormData();
      formData.append('role', newRole);
      
      const response = await api.post(`/usuarios/change-role/${userDetails.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("✅ Role alterado com sucesso:", response.data);
      
      // Atualizar os detalhes do usuário
      setUserDetails(prev => ({
        ...prev,
        role: newRole
      }));
      
      // Atualizar a lista de usuários
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(user => 
          user.id === userDetails.id 
            ? { ...user, role: newRole }
            : user
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
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        alert(`Erro: ${error.response?.data?.detail || 'Dados inválidos'}`);
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
      
      // Remover usuário da lista
      setUsuarios(prevUsuarios => 
        prevUsuarios.filter(user => user.id !== userToDelete.id)
      );
      
      // Fechar modal de detalhes se estiver aberto para este usuário
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
    if (!dateString || dateString === 'Informação não disponível') return dateString;
    return new Date(dateString).toLocaleString('pt-BR');
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <People sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Usuários do Sistema
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {usuarios.length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Total de Usuários
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {usuarios.filter(u => u.username === 'admin').length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Administradores
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="info.main" fontWeight="bold">
              {usuarios.filter(u => u.username !== 'admin').length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Usuários Regulares
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de Usuários */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            Lista de Usuários Cadastrados
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {usuarios.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <People sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Nenhum usuário encontrado
              </Typography>
            </Box>
          ) : (
            <List>
              {usuarios.map((usuario, index) => (
                <React.Fragment key={usuario.id}>
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: 'background.default',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getAvatarColor(index)}.main`,
                          width: 56,
                          height: 56,
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {getInitials(usuario.username)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" component="span">
                            {usuario.username}
                          </Typography>
                          {usuario.username === 'admin' && (
                            <Chip
                              icon={<AdminPanelSettings />}
                              label="Admin"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary">
                              {usuario.email}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            ID: {usuario.id}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                        <Chip
                          label="Ativo"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewUser(usuario)}
                            sx={{ minWidth: 'auto' }}
                          >
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteClick(usuario)}
                            sx={{ minWidth: 'auto' }}
                          >
                            Deletar
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  
                  {index < usuarios.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountCircle color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Detalhes do Usuário
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetails}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userDetails ? (
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info color="primary" />
                      Informações Básicas
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 64,
                          height: 64,
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          mr: 2
                        }}
                      >
                        {getInitials(userDetails.username)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {userDetails.username}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ID: {userDetails.id}
                        </Typography>
                        <Chip
                          icon={userDetails.username === 'admin' ? <AdminPanelSettings /> : <Person />}
                          label={userDetails.username === 'admin' ? 'Administrador' : 'Usuário Regular'}
                          color={userDetails.username === 'admin' ? 'error' : 'primary'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              Email:
                            </TableCell>
                            <TableCell>{userDetails.email}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              Status:
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={userDetails.sessaoAtiva ? 'Online' : 'Offline'}
                                color={userDetails.sessaoAtiva ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              Data de Criação:
                            </TableCell>
                            <TableCell>{formatDate(userDetails.dataCriacao)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              Último Login:
                            </TableCell>
                            <TableCell>{formatDate(userDetails.ultimoLogin)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Estatísticas e Atividades */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime color="primary" />
                      Atividades
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {userDetails.totalLicitacoes}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Licitações Criadas
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {userDetails.totalContratos}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Contratos Criados
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Permissões:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {userDetails.permissoes.map((permissao, index) => (
                        <Chip
                          key={index}
                          label={permissao}
                          size="small"
                          color={userDetails.username === 'admin' ? 'error' : 'primary'}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Informações de Segurança */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
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
                            >
                              {savingRole ? 'Salvando...' : 'Salvar'}
                            </Button>
                            
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={handleCancelEditRole}
                              disabled={savingRole}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              icon={userDetails.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                              label={userDetails.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
                              color={userDetails.role === 'admin' ? 'error' : 'primary'}
                              size="medium"
                            />
                            
                            {userDetails.id !== 1 && ( // Não permite editar o admin principal
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Edit />}
                                onClick={handleEditRole}
                              >
                                Alterar
                              </Button>
                            )}
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            ⚠️ Atenção:
                          </Typography>
                          <Typography variant="body2">
                            • Administradores têm acesso total ao sistema<br/>
                            • Usuários comuns têm acesso limitado<br/>
                            • Esta ação é irreversível
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Informações de Segurança */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color="primary" />
                      Segurança e Configurações
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Tipo de Conta
                          </Typography>
                          <Chip
                            label={userDetails.username === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                            color={userDetails.username === 'admin' ? 'error' : 'primary'}
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Autenticação
                          </Typography>
                          <Chip label="JWT Token" color="info" />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
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
        
        <DialogActions>
          <Button 
            onClick={() => handleDeleteClick(userDetails)} 
            color="error"
            variant="outlined"
            startIcon={<Delete />}
          >
            Deletar Usuário
          </Button>
          <Button onClick={handleCloseDetails} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Delete */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            • Todos os dados do usuário serão removidos permanentemente<br/>
            • O usuário não poderá mais acessar o sistema<br/>
            • Esta ação só pode ser realizada por administradores
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deletando...' : 'Confirmar Exclusão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;