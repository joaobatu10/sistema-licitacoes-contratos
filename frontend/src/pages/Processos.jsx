import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search,
  Description,
  AttachMoney,
  CalendarToday,
  Business,
  AccountBalance,
  Gavel,
} from "@mui/icons-material";
import api from "../services/api";
import dayjs from "dayjs";

const Processos = () => {
  const [licitacoes, setLicitacoes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando licitações e contratos...");

      const [licsResponse, consResponse] = await Promise.all([
        api.get("/licitacoes/"),
        api.get("/contratos/").catch(() => ({ data: [] })),
      ]);

      console.log("✅ Dados carregados:");
      console.log("Licitações:", licsResponse.data);
      console.log("Contratos:", consResponse.data);

      setLicitacoes(licsResponse.data || []);
      setContratos(consResponse.data || []);
      setError("");
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);

      if (error.response?.status === 401) {
        setError("Você precisa estar logado para visualizar os processos");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        setError("Você não tem permissão para visualizar os processos");
      } else {
        setError("Erro ao carregar dados dos processos");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "R$ 0,00";

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (Number.isNaN(numValue)) return "R$ 0,00";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).isValid() ? dayjs(dateString).format("DD/MM/YYYY") : dateString;
  };

  const getStatusColor = (status, type) => {
    const value = String(status || "").toLowerCase();

    if (type === "licitacao") {
      if (value.includes("aberta") || value.includes("aberto")) return "primary";
      if (value.includes("andamento")) return "warning";
      if (value.includes("encerrada") || value.includes("encerrado")) return "success";
      if (value.includes("cancelada") || value.includes("cancelado")) return "error";
      if (value.includes("homolog")) return "info";
      return "default";
    }

    if (value.includes("ativo")) return "success";
    if (value.includes("inativo")) return "error";
    if (value.includes("suspenso")) return "warning";
    if (value.includes("finalizado") || value.includes("encerrado")) return "info";
    return "default";
  };

  const filteredLicitacoes = licitacoes.filter((item) => {
    const term = searchTerm.toLowerCase();

    return (
      searchTerm === "" ||
      item.numero_processo?.toLowerCase().includes(term) ||
      item.objeto?.toLowerCase().includes(term) ||
      item.orgao_responsavel?.toLowerCase().includes(term) ||
      item.modalidade?.toLowerCase().includes(term)
    );
  });

  const filteredContratos = contratos.filter((item) => {
    const term = searchTerm.toLowerCase();

    return (
      searchTerm === "" ||
      item.numero_contrato?.toLowerCase().includes(term) ||
      item.objeto?.toLowerCase().includes(term) ||
      item.fornecedor?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    fetchData();
  }, []);

  const LicitacoesCards = () => (
    <Stack spacing={2}>
      {filteredLicitacoes.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              Nenhuma licitação encontrada
            </Typography>
          </CardContent>
        </Card>
      ) : (
        filteredLicitacoes.map((licitacao) => (
          <Card key={licitacao.id_licitacao} sx={{ borderRadius: 3, boxShadow: 2 }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "primary.main",
                        fontSize: "0.85rem",
                      }}
                    >
                      L
                    </Avatar>

                    <Typography fontWeight="bold">
                      {licitacao.numero_processo || "Sem número"}
                    </Typography>
                  </Box>

                  <Chip
                    label={licitacao.status || "N/A"}
                    color={getStatusColor(licitacao.status, "licitacao")}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>Modalidade:</strong> {licitacao.modalidade || "-"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Objeto:</strong> {licitacao.objeto || "-"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Órgão:</strong> {licitacao.orgao_responsavel || "-"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Data Abertura:</strong> {formatDate(licitacao.data_abertura)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Data Encerramento:</strong> {formatDate(licitacao.data_encerramento)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );

  const ContratosCards = () => (
    <Stack spacing={2}>
      {filteredContratos.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              Nenhum contrato encontrado
            </Typography>
          </CardContent>
        </Card>
      ) : (
        filteredContratos.map((contrato) => (
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "success.main",
                        fontSize: "0.85rem",
                      }}
                    >
                      C
                    </Avatar>

                    <Typography fontWeight="bold">
                      {contrato.numero_contrato || "Sem número"}
                    </Typography>
                  </Box>

                  <Chip
                    label={contrato.status || "N/A"}
                    color={getStatusColor(contrato.status, "contrato")}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  <strong>Fornecedor:</strong> {contrato.fornecedor || "-"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Objeto:</strong> {contrato.objeto || "-"}
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
                  <strong>Data Assinatura:</strong> {formatDate(contrato.data_assinatura)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Data Início:</strong> {formatDate(contrato.data_inicio)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Data Fim:</strong> {formatDate(contrato.data_fim)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );

  const LicitacoesTable = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
      <Table sx={{ minWidth: 950 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Gavel fontSize="small" />
                <strong>Processo</strong>
              </Box>
            </TableCell>
            <TableCell><strong>Modalidade</strong></TableCell>
            <TableCell><strong>Objeto</strong></TableCell>
            <TableCell><strong>Órgão</strong></TableCell>
            <TableCell><strong>Data Abertura</strong></TableCell>
            <TableCell><strong>Data Encerramento</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredLicitacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  Nenhuma licitação encontrada
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredLicitacoes.map((licitacao) => (
              <TableRow
                key={licitacao.id_licitacao}
                hover
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: "0.8rem",
                      }}
                    >
                      L
                    </Avatar>

                    <Typography variant="body2" fontWeight="bold">
                      {licitacao.numero_processo}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={licitacao.modalidade}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>

                <TableCell>
                  <Tooltip title={licitacao.objeto || ""}>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {licitacao.objeto}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {licitacao.orgao_responsavel}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(licitacao.data_abertura)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(licitacao.data_encerramento)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={licitacao.status}
                    color={getStatusColor(licitacao.status, "licitacao")}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ContratosTable = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
      <Table sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Description fontSize="small" />
                <strong>Contrato</strong>
              </Box>
            </TableCell>
            <TableCell><strong>Fornecedor</strong></TableCell>
            <TableCell><strong>Objeto</strong></TableCell>
            <TableCell><strong>Valor Total</strong></TableCell>
            <TableCell><strong>Valor/Mês</strong></TableCell>
            <TableCell><strong>Data Assinatura</strong></TableCell>
            <TableCell><strong>Data Início</strong></TableCell>
            <TableCell><strong>Data Fim</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredContratos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  Nenhum contrato encontrado
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredContratos.map((contrato) => (
              <TableRow
                key={contrato.id}
                hover
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                  "&:hover": { backgroundColor: "#e8f5e8" },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "success.main",
                        fontSize: "0.8rem",
                      }}
                    >
                      C
                    </Avatar>

                    <Typography variant="body2" fontWeight="bold">
                      {contrato.numero_contrato}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2">
                      {contrato.fornecedor}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Tooltip title={contrato.objeto || ""}>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {contrato.objeto}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoney fontSize="small" color="success" />
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatCurrency(contrato.valor_total)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoney fontSize="small" color="warning" />
                    <Typography variant="body2" color="warning.main">
                      {contrato.valor_parcela_mensal
                        ? formatCurrency(contrato.valor_parcela_mensal)
                        : "-"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(contrato.data_assinatura)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(contrato.data_inicio)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(contrato.data_fim)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={contrato.status}
                    color={getStatusColor(contrato.status, "contrato")}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
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
        <CircularProgress size={56} />
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
          <AccountBalance sx={{ fontSize: { xs: 30, sm: 34 }, color: "primary.main" }} />
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
              color: "primary.main",
            }}
          >
            Processos
          </Typography>
        </Box>

        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
          Visualize licitações e contratos cadastrados no sistema.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #e3f2fd 0%, #fff 100%)",
            }}
          >
            <Typography
              fontWeight="bold"
              color="primary.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {licitacoes.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Licitações Cadastradas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #e8f5e8 0%, #fff 100%)",
            }}
          >
            <Typography
              fontWeight="bold"
              color="success.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {contratos.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Contratos Cadastrados
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #fff3e0 0%, #fff 100%)",
            }}
          >
            <Typography
              fontWeight="bold"
              color="warning.main"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
            >
              {licitacoes.length + contratos.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total de Processos
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            fullWidth
            placeholder="Pesquisar por número, objeto, órgão, modalidade ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? `Resultados para "${searchTerm}": ${
                    filteredLicitacoes.length + filteredContratos.length
                  } processo(s)`
                : "Use a busca para localizar processos rapidamente"}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
              fullWidth={isMobile}
            >
              Limpar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            scrollButtons="auto"
          >
            <Tab label={`Licitações (${filteredLicitacoes.length})`} />
            <Tab label={`Contratos (${filteredContratos.length})`} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {tabValue === 0 && (isMobile ? <LicitacoesCards /> : <LicitacoesTable />)}
          {tabValue === 1 && (isMobile ? <ContratosCards /> : <ContratosTable />)}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Processos;