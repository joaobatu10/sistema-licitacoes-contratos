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
  Grid,
  Card,
  CardContent,
  Stack,
  TableContainer,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../services/api";

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, contrato: null });
  const [editDialog, setEditDialog] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [fornecedorFilter, setFornecedorFilter] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const statusOptions = [
    "Ativo",
    "Encerrado",
    "Suspenso",
    "Cancelado",
    "Pendente",
  ];

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "R$ 0,00";

    let number = value;

    if (typeof value === "string") {
      const parsedValue = parseValue(value);
      number = parseFloat(parsedValue);
    }

    if (isNaN(number)) return "R$ 0,00";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  const parseValue = (value) => {
    if (!value) return "";

    let cleanValue = value.toString().replace(/[R$\s]/g, "");

    if (cleanValue.includes(",")) {
      const parts = cleanValue.split(",");
      const integerPart = parts[0].replace(/\./g, "");
      const decimalPart = parts[1] || "";
      cleanValue = integerPart + (decimalPart ? "." + decimalPart : "");
    } else {
      const pointCount = (cleanValue.match(/\./g) || []).length;

      if (pointCount > 1) {
        const lastDotIndex = cleanValue.lastIndexOf(".");
        const beforeLastDot = cleanValue.substring(0, lastDotIndex);
        const afterLastDot = cleanValue.substring(lastDotIndex + 1);

        if (afterLastDot.length === 2) {
          const integerPart = beforeLastDot.replace(/\./g, "");
          cleanValue = integerPart + "." + afterLastDot;
        } else {
          cleanValue = cleanValue.replace(/\./g, "");
        }
      }
    }

    return cleanValue;
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const text = String(value);
    if (text.includes("-")) {
      const [year, month, day] = text.split("-");
      if (year && month && day) return `${day}/${month}/${year}`;
    }
    return text;
  };

  const handleValueChange = (e, isEdit = false) => {
    const { name, value } = e.target;

    if (name === "valor_total" || name === "valor_parcela_mensal") {
      const cleanValue = value.replace(/[^0-9.,]/g, "");

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
        const response = await api.get("/contratos/");
        console.log("✅ Contratos carregados:", response.data);

        setContratos(response.data || []);
        setFilteredContratos(response.data || []);
      } catch (error) {
        console.error("❌ Erro ao buscar contratos:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  useEffect(() => {
    let result = [...contratos];

    if (statusFilter) {
      result = result.filter((contrato) =>
        contrato.status?.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    if (fornecedorFilter.trim()) {
      result = result.filter((contrato) =>
        contrato.fornecedor?.toLowerCase().includes(fornecedorFilter.toLowerCase())
      );
    }

    setFilteredContratos(result);
  }, [contratos, statusFilter, fornecedorFilter]);

  const clearFilters = () => {
    setStatusFilter("");
    setFornecedorFilter("");
  };

  const resetForm = () => {
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
    });
  };

  const handleInputChange = (e) => {
    handleValueChange(e, false);
  };

  const handleEditInputChange = (e) => {
    handleValueChange(e, true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para cadastrar contratos. Redirecionando para login...");
      window.location.href = "/login";
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        licitacao_id: formData.licitacao_id ? Number(formData.licitacao_id) : null,
        valor_total: parseValue(formData.valor_total),
        valor_parcela_mensal: formData.valor_parcela_mensal
          ? parseValue(formData.valor_parcela_mensal)
          : null,
      };

      console.log("🚀 Enviando contrato via api.js...");
      console.log("📋 Dados a enviar:", dataToSend);

      const response = await api.post("/contratos/", dataToSend);
      console.log("✅ Contrato criado com sucesso:", response.data);

      const updated = [...contratos, response.data];
      setContratos(updated);
      setFilteredContratos(updated);
      resetForm();

      alert("Contrato cadastrado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao cadastrar contrato:", error);

      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para cadastrar contratos.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 422) {
        alert(
          `Erro de validação: ${JSON.stringify(
            error.response?.data?.detail || "Dados inválidos"
          )}`
        );
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
      await api.delete(`/contratos/${contrato.id}`);

      const updated = contratos.filter((c) => c.id !== contrato.id);
      setContratos(updated);
      setFilteredContratos(updated);
      setDeleteDialog({ open: false, contrato: null });
    } catch (error) {
      console.error("Erro ao deletar contrato:", error);

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
      numero_contrato: contrato.numero_contrato || "",
      licitacao_id: contrato.licitacao_id || "",
      objeto: contrato.objeto || "",
      fornecedor: contrato.fornecedor || "",
      valor_total: contrato.valor_total || "",
      valor_parcela_mensal: contrato.valor_parcela_mensal || "",
      data_assinatura: contrato.data_assinatura || "",
      data_inicio: contrato.data_inicio || "",
      data_fim: contrato.data_fim || "",
      status: contrato.status || "Ativo",
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const dataToSend = {
        ...editFormData,
        licitacao_id: editFormData.licitacao_id ? Number(editFormData.licitacao_id) : null,
        valor_total: parseValue(editFormData.valor_total),
        valor_parcela_mensal: editFormData.valor_parcela_mensal
          ? parseValue(editFormData.valor_parcela_mensal)
          : null,
      };

      console.log("🔄 Atualizando contrato:", editingContrato.id);
      console.log("📋 Dados para atualização:", dataToSend);

      const response = await api.put(`/contratos/${editingContrato.id}`, dataToSend);
      console.log("✅ Contrato atualizado com sucesso:", response.data);

      const updated = contratos.map((contrato) =>
        contrato.id === editingContrato.id ? response.data : contrato
      );

      setContratos(updated);
      setFilteredContratos(updated);
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
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 404) {
        alert("Erro: Contrato não encontrado.");
      } else if (error.response?.status === 422) {
        alert(
          `Erro de validação: ${JSON.stringify(
            error.response?.data?.detail || "Dados inválidos"
          )}`
        );
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

  const renderFormFields = (values, onChange, isEdit = false) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Número do Contrato"
          name="numero_contrato"
          value={values.numero_contrato || ""}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="ID da Licitação"
          name="licitacao_id"
          type="number"
          value={values.licitacao_id || ""}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Objeto"
          name="objeto"
          value={values.objeto || ""}
          onChange={onChange}
          fullWidth
          multiline
          rows={isMobile ? 3 : 2}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Fornecedor"
          name="fornecedor"
          value={values.fornecedor || ""}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={values.status || "Ativo"}
            onChange={onChange}
            label="Status"
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Valor Total"
          name="valor_total"
          type="text"
          value={values.valor_total || ""}
          onChange={onChange}
          fullWidth
          placeholder="Ex: 216.818,16 ou 216818.16"
          helperText="Formato: 1.234,56 ou 1234.56"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Valor da Parcela Mensal"
          name="valor_parcela_mensal"
          type="text"
          value={values.valor_parcela_mensal || ""}
          onChange={onChange}
          fullWidth
          placeholder="Ex: 21.818,18 ou 21818.18"
          helperText="Opcional"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Data de Assinatura"
          name="data_assinatura"
          type="date"
          value={values.data_assinatura || ""}
          onChange={onChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Data de Início"
          name="data_inicio"
          type="date"
          value={values.data_inicio || ""}
          onChange={onChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Data de Fim"
          name="data_fim"
          type="date"
          value={values.data_fim || ""}
          onChange={onChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );

  const getStatusColor = (status) => {
    const value = status?.toLowerCase() || "";

    if (value.includes("ativo")) return "success";
    if (value.includes("encerrado")) return "default";
    if (value.includes("cancelado")) return "error";
    if (value.includes("suspenso")) return "warning";
    return "primary";
  };

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
      <Box sx={{ mb: 3 }}>
        <Typography
          fontWeight="bold"
          sx={{
            fontSize: { xs: "1.8rem", sm: "2.2rem" },
            color: "success.main",
            mb: 0.5,
          }}
        >
          Contratos
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          Cadastre, filtre e gerencie os contratos do sistema.
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 2 }}
          >
            Novo Contrato
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {renderFormFields(formData, handleInputChange)}

            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth={isMobile}
              sx={{ mt: 3, py: 1.3 }}
            >
              Cadastrar Contrato
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: "success.main" }} />
            <Typography
              fontWeight="bold"
              color="success.main"
              sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}
            >
              Filtros
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 220 } }}>
              <InputLabel>Filtrar por Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filtrar por Status"
              >
                <MenuItem value="">
                  <em>Todos os status</em>
                </MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Filtrar por Fornecedor"
              value={fornecedorFilter}
              onChange={(e) => setFornecedorFilter(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 240 } }}
            />

            {(statusFilter || fornecedorFilter) && (
              <Button variant="outlined" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}

            <Typography variant="body2" color="text.secondary">
              {filteredContratos.length} de {contratos.length} contratos
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Typography
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Lista de Contratos
        </Typography>
      </Box>

      {filteredContratos.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              Nenhum contrato encontrado.
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredContratos.map((contrato) => (
            <Card key={contrato.id} sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography fontWeight="bold">
                      #{contrato.id} - {contrato.numero_contrato}
                    </Typography>

                    <Chip
                      label={contrato.status || "Não definido"}
                      size="small"
                      color={getStatusColor(contrato.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Objeto:</strong> {contrato.objeto || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Fornecedor:</strong> {contrato.fornecedor || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Valor Total:</strong> {formatCurrency(contrato.valor_total)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Valor/Mês:</strong>{" "}
                    {contrato.valor_parcela_mensal
                      ? formatCurrency(contrato.valor_parcela_mensal)
                      : "-"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Assinatura:</strong> {formatDate(contrato.data_assinatura)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Início:</strong> {formatDate(contrato.data_inicio)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Fim:</strong> {formatDate(contrato.data_fim)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      fullWidth
                      onClick={() => handleEditClick(contrato)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                      onClick={() => handleDeleteClick(contrato)}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Número do Contrato</TableCell>
                <TableCell>Objeto</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell>Valor Total</TableCell>
                <TableCell>Valor/Mês</TableCell>
                <TableCell>Data de Assinatura</TableCell>
                <TableCell>Data de Início</TableCell>
                <TableCell>Data de Fim</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredContratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell>{contrato.id}</TableCell>
                  <TableCell>{contrato.numero_contrato}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>{contrato.objeto}</TableCell>
                  <TableCell>{contrato.fornecedor}</TableCell>
                  <TableCell>{formatCurrency(contrato.valor_total)}</TableCell>
                  <TableCell>
                    {contrato.valor_parcela_mensal
                      ? formatCurrency(contrato.valor_parcela_mensal)
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(contrato.data_assinatura)}</TableCell>
                  <TableCell>{formatDate(contrato.data_inicio)}</TableCell>
                  <TableCell>{formatDate(contrato.data_fim)}</TableCell>
                  <TableCell>
                    <Chip
                      label={contrato.status || "Não definido"}
                      size="small"
                      color={getStatusColor(contrato.status)}
                      variant="outlined"
                    />
                  </TableCell>
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
        </TableContainer>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen={isMobile}
      >
        <DialogTitle id="alert-dialog-title">Confirmar exclusão</DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja deletar o contrato "
            {deleteDialog.contrato?.numero_contrato}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={handleDeleteCancel} color="primary" fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
            fullWidth={isMobile}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle id="edit-dialog-title">
          Editar Contrato {editingContrato ? `- ${editingContrato.numero_contrato}` : ""}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            id="edit-contrato-form"
            onSubmit={handleEditSubmit}
            sx={{ mt: 1 }}
          >
            {renderFormFields(editFormData, handleEditInputChange, true)}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={handleEditCancel} color="primary" fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-contrato-form"
            color="primary"
            variant="contained"
            fullWidth={isMobile}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contratos;