import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  TableContainer,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    quartel_29gacap: false,
    quartel_easa: false,
  });

  const modalidades = [
    "Pregão",
    "Dispensa Eletrônica",
    "Dispensa Direta",
    "Inexigibilidade",
  ];

  const normalizarQuartel = (valor) => {
    const texto = String(valor || "").toLowerCase().trim();

    if (texto.includes("29") && texto.includes("gac")) return "29º GAC AP";
    if (texto.includes("27") && texto.includes("gac")) return "27 GAC";
    if (texto.includes("ad/3") || texto.includes("ad3")) return "AD/3";
    if (texto.includes("easa")) return "EASA";

    return String(valor || "").trim();
  };

  const sanitizeGcalcData = (data) => {
    const dados = { ...data };
    const orgao = normalizarQuartel(dados.orgao_responsavel);

    if (!dados.is_gcalc) {
      dados.quartel_ad3 = false;
      dados.quartel_27gac = false;
      dados.quartel_29gacap = false;
      dados.quartel_easa = false;
      return dados;
    }

    if (orgao === "AD/3") dados.quartel_ad3 = false;
    if (orgao === "27 GAC") dados.quartel_27gac = false;
    if (orgao === "29º GAC AP") dados.quartel_29gacap = false;
    if (orgao === "EASA") dados.quartel_easa = false;

    return dados;
  };

  const formatarData = (data) => {
    if (!data) return "N/A";
    const valor = String(data);
    if (valor.includes("-")) {
      const [ano, mes, dia] = valor.split("-");
      if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    }
    return valor;
  };

  useEffect(() => {
    const fetchLicitacoes = async () => {
      try {
        console.log("🔍 Buscando licitações...");
        const response = await api.get("/licitacoes/");
        console.log("✅ Licitações carregadas:", response.data);

        setLicitacoes(response.data);
        setFilteredLicitacoes(response.data);

        const urlParams = new URLSearchParams(location.search);
        const licitacaoId = urlParams.get("id");

        if (licitacaoId) {
          setHighlightedLicitacao(parseInt(licitacaoId, 10));
          setTimeout(() => {
            setHighlightedLicitacao(null);
          }, 3000);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar licitações:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLicitacoes();
  }, [location.search]);

  useEffect(() => {
    if (modalidadeFilter === "") {
      setFilteredLicitacoes(licitacoes);
    } else {
      const filtered = licitacoes.filter((licitacao) =>
        licitacao.modalidade?.toLowerCase().includes(modalidadeFilter.toLowerCase())
      );
      setFilteredLicitacoes(filtered);
    }
  }, [licitacoes, modalidadeFilter]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      if (name === "is_gcalc" && !checked) {
        updated.quartel_ad3 = false;
        updated.quartel_27gac = false;
        updated.quartel_29gacap = false;
        updated.quartel_easa = false;
      }

      return updated;
    });
  };

  const handleModalidadeFilterChange = (event) => {
    setModalidadeFilter(event.target.value);
  };

  const clearFilter = () => {
    setModalidadeFilter("");
  };

  const resetForm = () => {
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
      quartel_29gacap: false,
      quartel_easa: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para cadastrar licitações. Redirecionando para login...");
      window.location.href = "/login";
      return;
    }

    try {
      const payload = sanitizeGcalcData(formData);

      console.log("🚀 Enviando licitação via api.js...");
      console.log("📋 Dados a enviar:", payload);

      const response = await api.post("/licitacoes/", payload);

      console.log("✅ Licitação criada com sucesso:", response.data);

      const newLicitacao = response.data;
      const updated = [...licitacoes, newLicitacao];

      setLicitacoes(updated);
      setFilteredLicitacoes(updated);
      resetForm();

      alert("Licitação cadastrada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao cadastrar licitação:", error);

      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para cadastrar licitações.");
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
      await api.delete(`/licitacoes/${licitacao.id_licitacao}`);

      const updated = licitacoes.filter((l) => l.id_licitacao !== licitacao.id_licitacao);
      setLicitacoes(updated);
      setFilteredLicitacoes(updated);
      setDeleteDialog({ open: false, licitacao: null });
    } catch (error) {
      console.error("Erro ao deletar licitação:", error);

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

  const handleEditClick = (licitacao) => {
    setEditDialog({ open: true, licitacao });

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
      quartel_29gacap: licitacao.quartel_29gacap || false,
      quartel_easa: licitacao.quartel_easa || false,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const { licitacao } = editDialog;
    if (!licitacao) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para editar licitações.");
      return;
    }

    try {
      const payload = sanitizeGcalcData(formData);

      console.log("🔄 Editando licitação...");
      console.log("📋 Dados a atualizar:", payload);

      const response = await api.put(`/licitacoes/${licitacao.id_licitacao}`, payload);

      console.log("✅ Licitação editada com sucesso:", response.data);

      const updatedLicitacoes = licitacoes.map((l) =>
        l.id_licitacao === licitacao.id_licitacao ? response.data : l
      );

      setLicitacoes(updatedLicitacoes);
      setFilteredLicitacoes(updatedLicitacoes);
      setEditDialog({ open: false, licitacao: null });
      resetForm();

      alert("Licitação editada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao editar licitação:", error);

      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão para editar licitações.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
      } else if (error.response?.status === 422) {
        alert(
          `Erro de validação: ${JSON.stringify(
            error.response?.data?.detail || "Dados inválidos"
          )}`
        );
      } else {
        alert("Erro ao editar licitação. Tente novamente.");
      }
    }
  };

  const handleEditCancel = () => {
    setEditDialog({ open: false, licitacao: null });
    resetForm();
  };

  const renderGcalcSection = () => (
    <>
      <Divider sx={{ my: 3 }}>
        <Typography
          color="primary"
          sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 600 }}
        >
          GCALC - Participação de Quartéis
        </Typography>
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
        sx={{ alignItems: "flex-start", mt: 1 }}
      />

      {formData.is_gcalc && (
        <Box
          sx={{
            ml: { xs: 0, sm: 4 },
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f8fafc",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Quartéis participantes:
          </Typography>

          <Stack>
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
                  checked={formData.quartel_29gacap}
                  onChange={handleInputChange}
                  name="quartel_29gacap"
                  color="primary"
                />
              }
              label="29º GAC AP"
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
          </Stack>
        </Box>
      )}
    </>
  );

  const renderFormFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Número do Processo"
          name="numero_processo"
          value={formData.numero_processo}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
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
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Objeto"
          name="objeto"
          value={formData.objeto}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={isMobile ? 3 : 2}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Órgão Responsável"
          name="orgao_responsavel"
          value={formData.orgao_responsavel}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
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
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Data de Abertura"
          name="data_abertura"
          type="date"
          value={formData.data_abertura}
          onChange={handleInputChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Data de Encerramento"
          name="data_encerramento"
          type="date"
          value={formData.data_encerramento}
          onChange={handleInputChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );

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
            color: "primary.main",
            mb: 0.5,
          }}
        >
          Licitações
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          Cadastre, filtre e gerencie as licitações do sistema.
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 2 }}
          >
            Nova Licitação
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {renderFormFields()}
            {renderGcalcSection()}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth={isMobile}
              sx={{ mt: 3, py: 1.3 }}
            >
              Cadastrar Licitação
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              fontWeight="bold"
              color="primary.main"
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

            <Typography variant="body2" color="text.secondary">
              {filteredLicitacoes.length} de {licitacoes.length} licitações
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Typography
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Lista de Licitações
        </Typography>
      </Box>

      {filteredLicitacoes.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              Nenhuma licitação encontrada.
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredLicitacoes.map((licitacao) => (
            <Card
              key={licitacao.id_licitacao}
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                border:
                  highlightedLicitacao === licitacao.id_licitacao
                    ? "2px solid"
                    : "1px solid",
                borderColor:
                  highlightedLicitacao === licitacao.id_licitacao
                    ? "primary.main"
                    : "divider",
                backgroundColor:
                  highlightedLicitacao === licitacao.id_licitacao
                    ? "rgba(25, 118, 210, 0.05)"
                    : "#fff",
              }}
            >
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
                      #{licitacao.id_licitacao} - {licitacao.numero_processo}
                    </Typography>

                    <Chip
                      label={licitacao.status || "Não definido"}
                      size="small"
                      color={
                        licitacao.status?.toLowerCase().includes("encerrado")
                          ? "success"
                          : licitacao.status?.toLowerCase().includes("homolog")
                          ? "success"
                          : licitacao.status?.toLowerCase().includes("cancel")
                          ? "error"
                          : licitacao.status?.toLowerCase().includes("aberto")
                          ? "primary"
                          : "warning"
                      }
                      variant={
                        licitacao.status?.toLowerCase().includes("homolog") ||
                        licitacao.status?.toLowerCase().includes("encerrado")
                          ? "filled"
                          : "outlined"
                      }
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Modalidade:</strong> {licitacao.modalidade || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Objeto:</strong> {licitacao.objeto || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Órgão:</strong> {licitacao.orgao_responsavel || "N/A"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Abertura:</strong> {formatarData(licitacao.data_abertura)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Encerramento:</strong>{" "}
                    {formatarData(licitacao.data_encerramento)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      fullWidth
                      onClick={() => handleEditClick(licitacao)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                      onClick={() => handleDeleteClick(licitacao)}
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
          <Table sx={{ minWidth: 1000 }}>
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
                    backgroundColor:
                      highlightedLicitacao === licitacao.id_licitacao
                        ? "rgba(25, 118, 210, 0.1)"
                        : "inherit",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor:
                        highlightedLicitacao === licitacao.id_licitacao
                          ? "rgba(25, 118, 210, 0.15)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <TableCell>{licitacao.id_licitacao}</TableCell>
                  <TableCell>{licitacao.numero_processo}</TableCell>
                  <TableCell>{licitacao.modalidade}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>{licitacao.objeto}</TableCell>
                  <TableCell>{licitacao.orgao_responsavel}</TableCell>
                  <TableCell>{formatarData(licitacao.data_abertura)}</TableCell>
                  <TableCell>{formatarData(licitacao.data_encerramento)}</TableCell>
                  <TableCell>
                    <Chip
                      label={licitacao.status || "Não definido"}
                      size="small"
                      color={
                        licitacao.status?.toLowerCase().includes("encerrado")
                          ? "success"
                          : licitacao.status?.toLowerCase().includes("homolog")
                          ? "success"
                          : licitacao.status?.toLowerCase().includes("cancel")
                          ? "error"
                          : licitacao.status?.toLowerCase().includes("aberto")
                          ? "primary"
                          : "warning"
                      }
                      variant={
                        licitacao.status?.toLowerCase().includes("homolog") ||
                        licitacao.status?.toLowerCase().includes("encerrado")
                          ? "filled"
                          : "outlined"
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
        </TableContainer>
      )}

      <Dialog
        open={editDialog.open}
        onClose={handleEditCancel}
        aria-labelledby="edit-dialog-title"
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle id="edit-dialog-title">
          Editar Licitação - {editDialog.licitacao?.numero_processo}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            id="edit-licitacao-form"
            onSubmit={handleEditSubmit}
            sx={{ mt: 1 }}
          >
            {renderFormFields()}
            {renderGcalcSection()}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={handleEditCancel} color="primary" fullWidth={isMobile}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-licitacao-form"
            color="primary"
            variant="contained"
            fullWidth={isMobile}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

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
            Tem certeza que deseja deletar a licitação "
            {deleteDialog.licitacao?.numero_processo}"? Esta ação não pode ser desfeita.
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
    </Box>
  );
};

export default Licitacoes;