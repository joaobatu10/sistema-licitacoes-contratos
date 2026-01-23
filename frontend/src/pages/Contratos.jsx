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
  DialogTitle
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import api from "../services/api";

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, contrato: null });
  const [editDialog, setEditDialog] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [formData, setFormData] = useState({
    numero_contrato: "",
    licitacao_id: "",
    objeto: "",
    fornecedor: "",
    valor_total: "",
    valor_parcela_mensal: "",
    data_assinatura: "",
    data_inicio: "",
    data_fim: "",
    status: "Ativo",
  });

  // Funções auxiliares para formatação de valores
  const formatCurrency = (value) => {
    if (!value) return "";
    
    // Se já é um número, usa diretamente
    let number = value;
    
    // Se é string, converte usando parseValue primeiro
    if (typeof value === 'string') {
      const parsedValue = parseValue(value);
      number = parseFloat(parsedValue);
    }
    
    // Verifica se é um número válido
    if (isNaN(number)) return "";
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const parseValue = (value) => {
    if (!value) return "";
    
    // Remove símbolos de moeda e espaços
    let cleanValue = value.toString().replace(/[R$\s]/g, '');
    
    // Verifica se tem vírgula (formato brasileiro)
    if (cleanValue.includes(',')) {
      // Se tem vírgula, os pontos são separadores de milhares
      // Ex: 1.234.567,89 -> 1234567.89
      const parts = cleanValue.split(',');
      const integerPart = parts[0].replace(/\./g, ''); // Remove pontos dos milhares
      const decimalPart = parts[1] || '';
      cleanValue = integerPart + (decimalPart ? '.' + decimalPart : '');
    } else {
      // Se não tem vírgula, verifica quantos pontos tem
      const pointCount = (cleanValue.match(/\./g) || []).length;
      
      if (pointCount > 1) {
        // Se tem múltiplos pontos, o último pode ser decimal
        // Ex: 216.818.16 -> assumir que .16 é decimal
        const lastDotIndex = cleanValue.lastIndexOf('.');
        const beforeLastDot = cleanValue.substring(0, lastDotIndex);
        const afterLastDot = cleanValue.substring(lastDotIndex + 1);
        
        // Se a parte após o último ponto tem 2 dígitos, provavelmente é decimal
        if (afterLastDot.length === 2) {
          // Remove pontos da parte inteira e mantém decimal
          const integerPart = beforeLastDot.replace(/\./g, '');
          cleanValue = integerPart + '.' + afterLastDot;
        } else {
          // Caso contrário, remove todos os pontos (são separadores de milhares)
          cleanValue = cleanValue.replace(/\./g, '');
        }
      }
      // Se tem apenas um ponto, assume formato americano (1234.56)
    }
    
    return cleanValue;
  };

  const handleValueChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (name === 'valor_total' || name === 'valor_parcela_mensal') {
      // Permite apenas números, pontos e vírgulas
      const cleanValue = value.replace(/[^0-9.,]/g, '');
      if (isEdit) {
        setEditFormData({ ...editFormData, [name]: cleanValue });
      } else {
        setFormData({ ...formData, [name]: cleanValue });
      }
    } else {
      if (isEdit) {
        setEditFormData({ ...editFormData, [name]: value });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        console.log("🔍 Buscando contratos...");
        
        // Usar api.js que tem os interceptors configurados
        const response = await api.get("/contratos/");
        
        console.log("✅ Contratos carregados:", response.data);
        
        setContratos(response.data);
      } catch (error) {
        console.error("❌ Erro ao buscar contratos:", error);
        
        // Tratamento específico para diferentes tipos de erro
        if (error.response?.status === 401) {
          console.log("Usuário não autenticado, redirecionando para login...");
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          console.log("Usuário sem permissão para visualizar contratos");
        } else {
          console.log("Erro de conexão ou servidor");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  const handleInputChange = (e) => {
    handleValueChange(e, false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Você precisa estar logado para cadastrar contratos. Redirecionando para login...");
      window.location.href = '/login';
      return;
    }
    
    try {
      console.log("🚀 Enviando contrato via api.js...");
      
      // Preparar dados para envio - converter valores para formato numérico
      const dataToSend = {
        ...formData,
        valor_total: parseValue(formData.valor_total),
        valor_parcela_mensal: formData.valor_parcela_mensal ? parseValue(formData.valor_parcela_mensal) : null
      };
      
      console.log("📋 Dados a enviar:", dataToSend);
      
      // Usar api.js que tem os interceptors e token automático
      const response = await api.post("/contratos/", dataToSend);
      
      console.log("✅ Contrato criado com sucesso:", response.data);
      
      const newContrato = response.data;
      setContratos([...contratos, newContrato]); // Atualiza a lista com o novo contrato
      setFormData({
        numero_contrato: "",
        licitacao_id: "",
        objeto: "",
        fornecedor: "",
        valor_total: "",
        valor_parcela_mensal: "",
        data_assinatura: "",
        data_inicio: "",
        data_fim: "",
        status: "Ativo",
      }); // Limpa o formulário
      
      alert("Contrato cadastrado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao cadastrar contrato:", error);
      
      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para cadastrar contratos.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 422) {
        alert(`Erro de validação: ${JSON.stringify(error.response?.data?.detail || 'Dados inválidos')}`);
      } else {
        alert("Erro ao cadastrar contrato. Verifique os dados e tente novamente.");
      }
    }
  };

  const handleDeleteClick = (contrato) => {
    setDeleteDialog({ open: true, contrato });
  };

  const handleDeleteConfirm = async () => {
    const { contrato } = deleteDialog;
    try {
      const response = await api.delete(`/contratos/${contrato.id}`);

      // Atualiza a lista removendo o contrato deletado
      setContratos(contratos.filter(c => c.id !== contrato.id));
      setDeleteDialog({ open: false, contrato: null });
      
      // Mostrar mensagem de sucesso
      console.log("Contrato deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar contrato:", error);
      
      // Mostrar mensagem de erro específica
      if (error.response?.status === 403) {
        alert("Erro: Apenas administradores podem deletar contratos!");
      } else if (error.response?.status === 401) {
        alert("Erro: Você precisa estar logado para realizar esta ação!");
      } else {
        alert("Erro ao deletar contrato. Tente novamente.");
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, contrato: null });
  };

  const handleEditClick = (contrato) => {
    setEditingContrato(contrato);
    setEditFormData({
      numero_contrato: contrato.numero_contrato,
      licitacao_id: contrato.licitacao_id,
      objeto: contrato.objeto,
      fornecedor: contrato.fornecedor,
      valor_total: contrato.valor_total,
      valor_parcela_mensal: contrato.valor_parcela_mensal || "",
      data_assinatura: contrato.data_assinatura,
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim || "",
      status: contrato.status
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      console.log("🔄 Atualizando contrato:", editingContrato.id);
      
      // Preparar dados para envio - converter valores para formato numérico
      const dataToSend = {
        ...editFormData,
        valor_total: parseValue(editFormData.valor_total),
        valor_parcela_mensal: editFormData.valor_parcela_mensal ? parseValue(editFormData.valor_parcela_mensal) : null
      };
      
      console.log("📋 Dados para atualização:", dataToSend);
      
      const response = await api.put(`/contratos/${editingContrato.id}`, dataToSend);
      
      console.log("✅ Contrato atualizado com sucesso:", response.data);
      
      // Atualizar a lista de contratos
      setContratos(contratos.map(contrato => 
        contrato.id === editingContrato.id ? response.data : contrato
      ));
      
      setEditDialog(false);
      setEditingContrato(null);
      setEditFormData({});
      
      alert("Contrato atualizado com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao atualizar contrato:", error);
      
      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para editar contratos.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 404) {
        alert("Erro: Contrato não encontrado.");
      } else if (error.response?.status === 422) {
        alert(`Erro de validação: ${JSON.stringify(error.response?.data?.detail || 'Dados inválidos')}`);
      } else {
        alert("Erro ao atualizar contrato. Verifique os dados e tente novamente.");
      }
    }
  };

  const handleEditCancel = () => {
    setEditDialog(false);
    setEditingContrato(null);
    setEditFormData({});
  };

  const handleEditInputChange = (e) => {
    handleValueChange(e, true);
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
        Contratos
      </Typography>

      {/* Formulário para cadastro */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Número do Contrato"
          name="numero_contrato"
          value={formData.numero_contrato}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="ID Contrato"
          name="licitacao_id"
          type="number"
          value={formData.licitacao_id}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Objeto"
          name="objeto"
          value={formData.objeto}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Fornecedor"
          name="fornecedor"
          value={formData.fornecedor}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Valor Total"
          name="valor_total"
          type="text"
          value={formData.valor_total}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          placeholder="Ex: 216.818,16 ou 216818.16"
          helperText="Formato brasileiro: 1.234,56 ou formato americano: 1234.56"
        />
        <TextField
          label="Valor da Parcela Mensal"
          name="valor_parcela_mensal"
          type="text"
          value={formData.valor_parcela_mensal}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          placeholder="Ex: 21.818,18 ou 21818.18"
          helperText="Opcional - Formato: 1.234,56 ou 1234.56"
        />
        <TextField
          label="Data de Assinatura"
          name="data_assinatura"
          type="date"
          value={formData.data_assinatura}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Data de Início"
          name="data_inicio"
          type="date"
          value={formData.data_inicio}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Data de Fim"
          name="data_fim"
          type="date"
          value={formData.data_fim}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Cadastrar Contrato
        </Button>
      </Box>

      {/* Tabela de contratos */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Número do Contrato</TableCell>
            <TableCell>Objeto</TableCell>
            <TableCell>Fornecedor</TableCell>
            <TableCell>Valor Total</TableCell>
            <TableCell>Valor/Mês</TableCell>
            <TableCell>Data de Início</TableCell>
            <TableCell>Data de Fim</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell>{contrato.id}</TableCell>
              <TableCell>{contrato.numero_contrato}</TableCell>
              <TableCell>{contrato.objeto}</TableCell>
              <TableCell>{contrato.fornecedor}</TableCell>
              <TableCell>{formatCurrency(contrato.valor_total)}</TableCell>
              <TableCell>
                {contrato.valor_parcela_mensal ? formatCurrency(contrato.valor_parcela_mensal) : "-"}
              </TableCell>
              <TableCell>{contrato.data_inicio}</TableCell>
              <TableCell>{contrato.data_fim || "N/A"}</TableCell>
              <TableCell>{contrato.status}</TableCell>
              <TableCell>
                <IconButton 
                  color="primary" 
                  onClick={() => handleEditClick(contrato)}
                  title="Editar contrato"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => handleDeleteClick(contrato)}
                  title="Deletar contrato"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
            Tem certeza que deseja deletar o contrato "{deleteDialog.contrato?.numero_contrato}"?
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

      {/* Modal de edição */}
      <Dialog
        open={editDialog}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">
          Editar Contrato
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Número do Contrato"
            name="numero_contrato"
            value={editFormData.numero_contrato || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ID da Licitação"
            name="licitacao_id"
            type="number"
            value={editFormData.licitacao_id || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Objeto"
            name="objeto"
            value={editFormData.objeto || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Fornecedor"
            name="fornecedor"
            value={editFormData.fornecedor || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valor Total"
            name="valor_total"
            type="text"
            value={editFormData.valor_total || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            placeholder="Ex: 216.818,16 ou 216818.16"
            helperText="Formato brasileiro: 1.234,56 ou formato americano: 1234.56"
          />
          <TextField
            label="Valor da Parcela Mensal"
            name="valor_parcela_mensal"
            type="text"
            value={editFormData.valor_parcela_mensal || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            placeholder="Ex: 21.818,18 ou 21818.18"
            helperText="Opcional - Formato: 1.234,56 ou 1234.56"
          />
          <TextField
            label="Data de Assinatura"
            name="data_assinatura"
            type="date"
            value={editFormData.data_assinatura || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Data de Início"
            name="data_inicio"
            type="date"
            value={editFormData.data_inicio || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Data de Fim"
            name="data_fim"
            type="date"
            value={editFormData.data_fim || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Status"
            name="status"
            value={editFormData.status || ""}
            onChange={handleEditInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contratos;