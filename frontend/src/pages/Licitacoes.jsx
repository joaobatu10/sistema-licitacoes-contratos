import React, { useEffect, useState } from "react";
import { 
  Box, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  FormControlLabel,
  Checkbox,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useLocation } from "react-router-dom";
import api from "../services/api";

const Licitacoes = () => {
  const [licitacoes, setLicitacoes] = useState([]);
  const [filteredLicitacoes, setFilteredLicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, licitacao: null });
  const [editDialog, setEditDialog] = useState({ open: false, licitacao: null });
  const [highlightedLicitacao, setHighlightedLicitacao] = useState(null);
  const [modalidadeFilter, setModalidadeFilter] = useState("");
  const location = useLocation();
  const [formData, setFormData] = useState({
    numero_processo: "",
    modalidade: "",
    objeto: "",
    orgao_responsavel: "",
    data_abertura: "",
    data_encerramento: "",
    status: "",
    is_gcalc: false,
    quartel_ad3: false,
    quartel_27gac: false,
    quartel_easa: false,
  });

  // Modalidades disponíveis
  const modalidades = [
    "Pregão",
    "Dispensa Eletrônica", 
    "Dispensa Direta",
    "Inexigibilidade"
  ];

  useEffect(() => {
    const fetchLicitacoes = async () => {
      try {
        console.log("🔍 Buscando licitações...");
        
        // Usar api.js que tem os interceptors configurados
        const response = await api.get("/licitacoes/");
        
        console.log("✅ Licitações carregadas:", response.data);
        
        setLicitacoes(response.data);
        setFilteredLicitacoes(response.data);
        
        // Verificar se há um ID na URL para destacar
        const urlParams = new URLSearchParams(location.search);
        const licitacaoId = urlParams.get('id');
        if (licitacaoId) {
          setHighlightedLicitacao(parseInt(licitacaoId));
          // Remover o destaque após 3 segundos
          setTimeout(() => {
            setHighlightedLicitacao(null);
          }, 3000);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar licitações:", error);
        
        // Tratamento específico para diferentes tipos de erro
        if (error.response?.status === 401) {
          console.log("Usuário não autenticado, redirecionando para login...");
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          console.log("Usuário sem permissão para visualizar licitações");
        } else {
          console.log("Erro de conexão ou servidor");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLicitacoes();
  }, [location.search]);

  // Filtrar licitações por modalidade
  useEffect(() => {
    if (modalidadeFilter === "") {
      setFilteredLicitacoes(licitacoes);
    } else {
      const filtered = licitacoes.filter(licitacao => 
        licitacao.modalidade?.toLowerCase().includes(modalidadeFilter.toLowerCase())
      );
      setFilteredLicitacoes(filtered);
    }
  }, [licitacoes, modalidadeFilter]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleModalidadeFilterChange = (event) => {
    setModalidadeFilter(event.target.value);
  };

  const clearFilter = () => {
    setModalidadeFilter("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Você precisa estar logado para cadastrar licitações. Redirecionando para login...");
      window.location.href = '/login';
      return;
    }
    
    try {
      console.log("🚀 Enviando licitação via api.js...");
      console.log("📋 Dados a enviar:", formData);
      
      // Usar api.js que tem os interceptors e token automático
      const response = await api.post("/licitacoes/", formData);
      
      console.log("✅ Licitação criada com sucesso:", response.data);
      
      const newLicitacao = response.data;
      setLicitacoes([...licitacoes, newLicitacao]); // Atualiza a lista com a nova licitação
      setFormData({
        numero_processo: "",
        modalidade: "",
        objeto: "",
        orgao_responsavel: "",
        data_abertura: "",
        data_encerramento: "",
        status: "",
        is_gcalc: false,
        quartel_ad3: false,
        quartel_27gac: false,
        quartel_easa: false,
      }); // Limpa o formulário
      
      alert("Licitação cadastrada com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao cadastrar licitação:", error);
      
      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para cadastrar licitações.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 422) {
        alert(`Erro de validação: ${JSON.stringify(error.response?.data?.detail || 'Dados inválidos')}`);
      } else {
        alert("Erro ao cadastrar licitação. Verifique os dados e tente novamente.");
      }
    }
  };

  const handleDeleteClick = (licitacao) => {
    setDeleteDialog({ open: true, licitacao });
  };

  const handleDeleteConfirm = async () => {
    const { licitacao } = deleteDialog;
    try {
      const response = await api.delete(`/licitacoes/${licitacao.id_licitacao}`);

      // Atualiza a lista removendo a licitação deletada
      setLicitacoes(licitacoes.filter(l => l.id_licitacao !== licitacao.id_licitacao));
      setDeleteDialog({ open: false, licitacao: null });
      
      // Mostrar mensagem de sucesso
      console.log("Licitação deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar licitação:", error);
      
      // Mostrar mensagem de erro específica
      if (error.response?.status === 403) {
        alert("Erro: Apenas administradores podem deletar licitações!");
      } else if (error.response?.status === 401) {
        alert("Erro: Você precisa estar logado para realizar esta ação!");
      } else {
        alert("Erro ao deletar licitação. Tente novamente.");
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, licitacao: null });
  };

  // Funções de edição
  const handleEditClick = (licitacao) => {
    setEditDialog({ open: true, licitacao });
    // Preencher o formulário com os dados da licitação
    setFormData({
      numero_processo: licitacao.numero_processo || "",
      modalidade: licitacao.modalidade || "",
      objeto: licitacao.objeto || "",
      orgao_responsavel: licitacao.orgao_responsavel || "",
      data_abertura: licitacao.data_abertura || "",
      data_encerramento: licitacao.data_encerramento || "",
      status: licitacao.status || "",
      is_gcalc: licitacao.is_gcalc || false,
      quartel_ad3: licitacao.quartel_ad3 || false,
      quartel_27gac: licitacao.quartel_27gac || false,
      quartel_easa: licitacao.quartel_easa || false,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const { licitacao } = editDialog;
    if (!licitacao) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Você precisa estar logado para editar licitações.");
      return;
    }
    
    try {
      console.log("🔄 Editando licitação...");
      console.log("📋 Dados a atualizar:", formData);
      
      const response = await api.put(`/licitacoes/${licitacao.id_licitacao}`, formData);
      
      console.log("✅ Licitação editada com sucesso:", response.data);
      
      // Atualizar a lista local
      const updatedLicitacoes = licitacoes.map(l => 
        l.id_licitacao === licitacao.id_licitacao ? response.data : l
      );
      setLicitacoes(updatedLicitacoes);
      setFilteredLicitacoes(updatedLicitacoes);
      
      // Fechar dialog e limpar formulário
      setEditDialog({ open: false, licitacao: null });
      setFormData({
        numero_processo: "",
        modalidade: "",
        objeto: "",
        orgao_responsavel: "",
        data_abertura: "",
        data_encerramento: "",
        status: "",
        is_gcalc: false,
        quartel_ad3: false,
        quartel_27gac: false,
        quartel_easa: false,
      });
      
      alert("Licitação editada com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao editar licitação:", error);
      
      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão para editar licitações.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
      } else if (error.response?.status === 422) {
        alert(`Erro de validação: ${JSON.stringify(error.response?.data?.detail || 'Dados inválidos')}`);
      } else {
        alert("Erro ao editar licitação. Tente novamente.");
      }
    }
  };

  const handleEditCancel = () => {
    setEditDialog({ open: false, licitacao: null });
    // Limpar formulário
    setFormData({
      numero_processo: "",
      modalidade: "",
      objeto: "",
      orgao_responsavel: "",
      data_abertura: "",
      data_encerramento: "",
      status: "",
      is_gcalc: false,
      quartel_ad3: false,
      quartel_27gac: false,
      quartel_easa: false,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Licitações
      </Typography>

      {/* Formulário para cadastro */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Número do Processo"
          name="numero_processo"
          value={formData.numero_processo}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Modalidade</InputLabel>
          <Select
            name="modalidade"
            value={formData.modalidade}
            onChange={handleInputChange}
            label="Modalidade"
          >
            {modalidades.map((modalidade) => (
              <MenuItem key={modalidade} value={modalidade}>
                {modalidade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Objeto"
          name="objeto"
          value={formData.objeto}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Órgão Responsável"
          name="orgao_responsavel"
          value={formData.orgao_responsavel}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Data de Abertura"
          name="data_abertura"
          type="date"
          value={formData.data_abertura}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Data de Encerramento"
          name="data_encerramento"
          type="date"
          value={formData.data_encerramento}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            label="Status"
          >
            <MenuItem value="Aberto">Aberto</MenuItem>
            <MenuItem value="Encerrado">Encerrado</MenuItem>
            <MenuItem value="Em Andamento">Em Andamento</MenuItem>
            <MenuItem value="Homologado">Homologado</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem>
          </Select>
        </FormControl>
        
        {/* Seção GCALC */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="h6" color="primary">GCALC - Participação de Quartéis</Typography>
        </Divider>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.is_gcalc}
              onChange={handleInputChange}
              name="is_gcalc"
              color="primary"
            />
          }
          label="Esta licitação é GCALC (outros quartéis participam)"
        />
        
        {formData.is_gcalc && (
          <Box sx={{ ml: 4, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Quartéis participantes:
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.quartel_ad3}
                  onChange={handleInputChange}
                  name="quartel_ad3"
                  color="primary"
                />
              }
              label="AD/3"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.quartel_27gac}
                  onChange={handleInputChange}
                  name="quartel_27gac"
                  color="primary"
                />
              }
              label="27 GAC"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.quartel_easa}
                  onChange={handleInputChange}
                  name="quartel_easa"
                  color="primary"
                />
              }
              label="EASA"
            />
          </Box>
        )}
        
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Cadastrar Licitação
        </Button>
      </Box>

      {/* Seção de Filtros */}
      <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main">
            Filtros
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Modalidade</InputLabel>
            <Select
              value={modalidadeFilter}
              onChange={handleModalidadeFilterChange}
              label="Filtrar por Modalidade"
            >
              <MenuItem value="">
                <em>Todas as modalidades</em>
              </MenuItem>
              {modalidades.map((modalidade) => (
                <MenuItem key={modalidade} value={modalidade}>
                  {modalidade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {modalidadeFilter && (
            <Chip
              label={`Modalidade: ${modalidadeFilter}`}
              onDelete={clearFilter}
              color="primary"
              variant="outlined"
            />
          )}
          
          <Typography variant="body2" color="textSecondary">
            {filteredLicitacoes.length} de {licitacoes.length} licitações
          </Typography>
        </Box>
      </Box>

      {/* Tabela de licitações */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Número do Processo</TableCell>
            <TableCell>Modalidade</TableCell>
            <TableCell>Objeto</TableCell>
            <TableCell>Órgão Responsável</TableCell>
            <TableCell>Data de Abertura</TableCell>
            <TableCell>Data de Encerramento</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLicitacoes.map((licitacao) => (
            <TableRow 
              key={licitacao.id_licitacao}
              sx={{
                backgroundColor: highlightedLicitacao === licitacao.id_licitacao 
                  ? 'rgba(25, 118, 210, 0.1)' 
                  : 'inherit',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: highlightedLicitacao === licitacao.id_licitacao 
                    ? 'rgba(25, 118, 210, 0.15)' 
                    : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <TableCell>{licitacao.id_licitacao}</TableCell>
              <TableCell>{licitacao.numero_processo}</TableCell>
              <TableCell>{licitacao.modalidade}</TableCell>
              <TableCell>{licitacao.objeto}</TableCell>
              <TableCell>{licitacao.orgao_responsavel}</TableCell>
              <TableCell>{licitacao.data_abertura}</TableCell>
              <TableCell>{licitacao.data_encerramento || "N/A"}</TableCell>
              <TableCell>
                <Chip 
                  label={licitacao.status || 'Não definido'}
                  size="small"
                  color={
                    licitacao.status?.toLowerCase().includes('encerrado') ? 'success' :
                    licitacao.status?.toLowerCase().includes('homolog') ? 'success' :
                    licitacao.status?.toLowerCase().includes('cancel') ? 'error' :
                    licitacao.status?.toLowerCase().includes('aberto') ? 'primary' :
                    'warning'
                  }
                  variant={
                    licitacao.status?.toLowerCase().includes('homolog') ? 'filled' :
                    licitacao.status?.toLowerCase().includes('encerrado') ? 'filled' :
                    'outlined'
                  }
                />
              </TableCell>
              <TableCell>
                <IconButton 
                  color="primary" 
                  onClick={() => handleEditClick(licitacao)}
                  title="Editar licitação"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => handleDeleteClick(licitacao)}
                  title="Deletar licitação"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de edição */}
      <Dialog
        open={editDialog.open}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">
          Editar Licitação - {editDialog.licitacao?.numero_processo}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            <TextField
              name="numero_processo"
              label="Número do Processo"
              value={formData.numero_processo}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="modalidade"
              label="Modalidade"
              value={formData.modalidade}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="objeto"
              label="Objeto"
              value={formData.objeto}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              name="orgao_responsavel"
              label="Órgão Responsável"
              value={formData.orgao_responsavel}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="data_abertura"
              label="Data de Abertura"
              type="date"
              value={formData.data_abertura}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              name="data_encerramento"
              label="Data de Encerramento"
              type="date"
              value={formData.data_encerramento}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="Aberto">Aberto</MenuItem>
                <MenuItem value="Encerrado">Encerrado</MenuItem>
                <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                <MenuItem value="Homologado">Homologado</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
            
            {/* Seção GCALC no dialog de edição */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="h6" color="primary">GCALC - Participação de Quartéis</Typography>
            </Divider>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_gcalc}
                  onChange={handleInputChange}
                  name="is_gcalc"
                  color="primary"
                />
              }
              label="Esta licitação é GCALC (outros quartéis participam)"
            />
            
            {formData.is_gcalc && (
              <Box sx={{ ml: 4, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Quartéis participantes:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.quartel_ad3}
                      onChange={handleInputChange}
                      name="quartel_ad3"
                      color="primary"
                    />
                  }
                  label="AD/3"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.quartel_27gac}
                      onChange={handleInputChange}
                      name="quartel_27gac"
                      color="primary"
                    />
                  }
                  label="27 GAC"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.quartel_easa}
                      onChange={handleInputChange}
                      name="quartel_easa"
                      color="primary"
                    />
                  }
                  label="EASA"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de delete */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja deletar a licitação "{deleteDialog.licitacao?.numero_processo}"?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Licitacoes;
