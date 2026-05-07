import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import SortIcon from "@mui/icons-material/Sort";
import api from "../services/api";

const GCALC = () => {
  const [licitacoesGcalc, setLicitacoesGcalc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [orgaoFilter, setOrgaoFilter] = useState("");
  const [filters, setFilters] = useState({
    ad3: false,
    gac27: false,
    gac29: false,
    easa: false,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const quarteis = [
    { key: "ad3", label: "AD/3", field: "quartel_ad3", orgao: "AD/3" },
    { key: "gac27", label: "27 GAC", field: "quartel_27gac", orgao: "27 GAC" },
    { key: "gac29", label: "29º GAC AP", field: "quartel_29gacap", orgao: "29º GAC AP" },
    { key: "easa", label: "EASA", field: "quartel_easa", orgao: "EASA" },
  ];

  useEffect(() => {
    fetchLicitacoesGcalc();
  }, []);

  const normalizarQuartel = (valor) => {
    const texto = String(valor || "").toLowerCase().trim();

    if (texto.includes("29") && texto.includes("gac")) return "29º GAC AP";
    if (texto.includes("27") && texto.includes("gac")) return "27 GAC";
    if (texto.includes("ad/3") || texto.includes("ad3")) return "AD/3";
    if (texto.includes("easa")) return "EASA";

    return String(valor || "").trim();
  };

  const getQuarteisParticipantes = (licitacao) => {
    const participantes = [];

    if (licitacao.quartel_ad3) participantes.push("AD/3");
    if (licitacao.quartel_27gac) participantes.push("27 GAC");
    if (licitacao.quartel_29gacap) participantes.push("29º GAC AP");
    if (licitacao.quartel_easa) participantes.push("EASA");

    const orgaoDono = normalizarQuartel(licitacao.orgao_responsavel);

    return participantes.filter((quartel) => quartel !== orgaoDono);
  };

  const participaDoQuartel = (licitacao, quartel) => {
    return getQuarteisParticipantes(licitacao).includes(quartel);
  };

  const fetchLicitacoesGcalc = async () => {
    try {
      setLoading(true);

      const response = await api.get("/licitacoes/");

      const gcalcLicitacoes = (response.data || []).filter(
        (licitacao) =>
          licitacao.is_gcalc ||
          licitacao.quartel_ad3 ||
          licitacao.quartel_27gac ||
          licitacao.quartel_29gacap ||
          licitacao.quartel_easa
      );

      setLicitacoesGcalc(gcalcLicitacoes);
    } catch (error) {
      console.error("Erro ao buscar licitações GCALC:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "aberta":
      case "aberto":
        return "success";
      case "fechada":
      case "encerrado":
      case "encerrada":
        return "error";
      case "em andamento":
        return "warning";
      case "homologado":
      case "homologada":
        return "info";
      default:
        return "default";
    }
  };

  const sortByOrgao = (licitacoes) => {
    return [...licitacoes].sort((a, b) => {
      const orgaoA = normalizarQuartel(a.orgao_responsavel || "");
      const orgaoB = normalizarQuartel(b.orgao_responsavel || "");

      const prioridade = {
        "AD/3": 1,
        "27 GAC": 2,
        "29º GAC AP": 3,
        EASA: 4,
      };

      const prioridadeA = prioridade[orgaoA] || 999;
      const prioridadeB = prioridade[orgaoB] || 999;

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      return orgaoA.localeCompare(orgaoB);
    });
  };

  const filteredLicitacoes = sortByOrgao(
    licitacoesGcalc.filter((licitacao) => {
      const matchesSearch =
        licitacao.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licitacao.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licitacao.orgao_responsavel?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        (!filters.ad3 || participaDoQuartel(licitacao, "AD/3")) &&
        (!filters.gac27 || participaDoQuartel(licitacao, "27 GAC")) &&
        (!filters.gac29 || participaDoQuartel(licitacao, "29º GAC AP")) &&
        (!filters.easa || participaDoQuartel(licitacao, "EASA"));

      const matchesOrgao =
        !orgaoFilter || normalizarQuartel(licitacao.orgao_responsavel) === orgaoFilter;

      return matchesSearch && matchesFilter && matchesOrgao;
    })
  );

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
  };

  const clearFilters = () => {
    setFilters({
      ad3: false,
      gac27: false,
      gac29: false,
      easa: false,
    });
    setOrgaoFilter("");
  };

  const handleTotalClick = () => {
    setOrgaoFilter("");
  };

  const handleOrgaoClick = (orgao) => {
    setOrgaoFilter(orgaoFilter === orgao ? "" : orgao);
  };

  const getActiveFiltersCount = () => {
    const filterCount = Object.values(filters).filter(Boolean).length;
    const orgaoCount = orgaoFilter ? 1 : 0;
    return filterCount + orgaoCount;
  };

  const formatDate = (data) => {
    if (!data) return "N/A";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Carregando licitações GCALC...</Typography>
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
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <GroupWorkIcon />
          GCALC - Licitações Colaborativas
        </Typography>

        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
          Gerenciamento de licitações com participação de múltiplos quartéis.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              border: orgaoFilter === "" ? 2 : 1,
              borderColor: orgaoFilter === "" ? "primary.main" : "divider",
              backgroundColor: orgaoFilter === "" ? "primary.light" : "background.paper",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 3,
              },
            }}
            onClick={handleTotalClick}
          >
            <CardContent>
              <Typography
                variant="h6"
                color={orgaoFilter === "" ? "primary.contrastText" : "text.primary"}
              >
                {licitacoesGcalc.length}
              </Typography>
              <Typography
                variant="body2"
                color={orgaoFilter === "" ? "primary.contrastText" : "text.secondary"}
              >
                Total GCALC
                {orgaoFilter === "" && " (Todos)"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {quarteis.map((quartel) => {
            const count = licitacoesGcalc.filter((l) =>
              normalizarQuartel(l.orgao_responsavel) === quartel.orgao
            ).length;

            const isActive = orgaoFilter === quartel.orgao;

          return (
            <Grid item xs={12} sm={6} md={3} key={quartel.key}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: isActive ? 2 : 1,
                  borderColor: isActive ? "primary.main" : "divider",
                  backgroundColor: isActive ? "primary.light" : "background.paper",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleOrgaoClick(quartel.orgao)}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    color={isActive ? "primary.contrastText" : "text.primary"}
                  >
                    {count}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isActive ? "primary.contrastText" : "text.secondary"}
                  >
                    {quartel.label}
                    {isActive && " (Filtrado)"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {orgaoFilter !== "" && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: "primary.light", borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="body1" color="primary.contrastText">
              🔍 Mostrando apenas licitações do órgão: <strong>{orgaoFilter}</strong>
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => setOrgaoFilter("")}
              fullWidth={isMobile}
            >
              Limpar Filtro
            </Button>
          </Box>
        </Box>
      )}

      {orgaoFilter === "" && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: "success.light", borderRadius: 2 }}>
          <Typography variant="body1" color="success.contrastText">
            📋 Mostrando <strong>todas as licitações GCALC</strong> ({licitacoesGcalc.length} total)
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <TextField
          placeholder="Buscar por processo, objeto ou órgão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterOpen(true)}
          color={getActiveFiltersCount() > 0 ? "primary" : "inherit"}
          fullWidth={isMobile}
        >
          Filtros {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>
      </Box>

      <Box sx={{ mb: 2, p: 1.5, backgroundColor: "grey.100", borderRadius: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}
        >
          <SortIcon fontSize="small" />
          Licitações ordenadas por órgão: AD/3 → 27 GAC → 29º GAC AP → EASA → Outros
        </Typography>
      </Box>

      {filteredLicitacoes.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              {searchTerm || getActiveFiltersCount() > 0
                ? "Nenhuma licitação encontrada com os filtros aplicados"
                : "Nenhuma licitação GCALC cadastrada"}
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredLicitacoes.map((licitacao) => (
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
                    <Typography fontWeight="bold">{licitacao.numero_processo}</Typography>
                    <Chip
                      label={licitacao.status}
                      color={getStatusColor(licitacao.status)}
                      size="small"
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
                    <strong>Data Abertura:</strong> {formatDate(licitacao.data_abertura)}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pt: 0.5 }}>
                    {getQuarteisParticipantes(licitacao).length > 0 ? (
                      getQuarteisParticipantes(licitacao).map((quartel) => (
                        <Chip
                          key={quartel}
                          label={quartel}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Participantes:</strong> Nenhum quartel adicional
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Processo</TableCell>
                <TableCell>Modalidade</TableCell>
                <TableCell>Objeto</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Órgão
                    <SortIcon fontSize="small" color="primary" />
                  </Box>
                </TableCell>
                <TableCell>Data Abertura</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Quartéis Participantes</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLicitacoes.map((licitacao) => (
                <TableRow key={licitacao.id_licitacao} hover>
                  <TableCell>{licitacao.numero_processo}</TableCell>
                  <TableCell>{licitacao.modalidade}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={licitacao.objeto}
                    >
                      {licitacao.objeto}
                    </Typography>
                  </TableCell>
                  <TableCell>{licitacao.orgao_responsavel}</TableCell>
                  <TableCell>{formatDate(licitacao.data_abertura)}</TableCell>
                  <TableCell>
                    <Chip
                      label={licitacao.status}
                      color={getStatusColor(licitacao.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {getQuarteisParticipantes(licitacao).map((quartel) => (
                        <Chip
                          key={quartel}
                          label={quartel}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Filtrar por Quartéis Participantes</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione os quartéis participantes para filtrar as licitações:
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            {quarteis.map((quartel) => (
              <FormControlLabel
                key={quartel.key}
                control={
                  <Checkbox
                    checked={filters[quartel.key]}
                    onChange={handleFilterChange}
                    name={quartel.key}
                  />
                }
                label={quartel.label}
              />
            ))}
          </FormGroup>
        </DialogContent>

        <DialogActions sx={{ p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={clearFilters} fullWidth={isMobile}>
            Limpar
          </Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained" fullWidth={isMobile}>
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GCALC;