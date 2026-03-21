import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import api from "../services/api";
import {
  PictureAsPdf,
  Assessment,
  Description,
  Work,
  FilterList,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

const Relatorios = () => {
  const [licitacoes, setLicitacoes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoRelatorio: "ambos",
    dataInicio: "",
    dataFim: "",
    modalidade: "",
    status: "",
  });
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const modalidades = [
    "Pregão",
    "Dispensa Eletrônica",
    "Dispensa Direta",
    "Inexigibilidade",
  ];

  const statusOptions = [
    "Em andamento",
    "Concluído",
    "Cancelado",
    "Suspenso",
    "Ativo",
    "Encerrado",
    "Homologado",
  ];

  const formatDate = (value) => {
    if (!value) return "N/A";
    return dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY") : value;
  };

  const formatCurrencyValue = (value) => {
    if (value === null || value === undefined || value === "" || value === "N/A") {
      return "N/A";
    }

    if (typeof value === "number") {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    const parsed = Number(String(value).replace(/\./g, "").replace(",", "."));
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    return String(value);
  };

  const getStatusColor = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("conclu") ||
      value.includes("homolog") ||
      value.includes("encerr")
    ) {
      return "success";
    }
    if (value.includes("cancel")) return "error";
    if (value.includes("suspens")) return "warning";
    if (value.includes("aberto") || value.includes("andamento") || value.includes("ativo")) {
      return "primary";
    }
    return "default";
  };

  const fetchLicitacoes = async () => {
    try {
      const response = await api.get("/licitacoes/");
      setLicitacoes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar licitações:", error);
    }
  };

  const fetchContratos = async () => {
    try {
      const response = await api.get("/contratos/");
      setContratos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    }
  };

  useEffect(() => {
    fetchLicitacoes();
    fetchContratos();
  }, []);

  const handleFiltroChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const aplicarFiltros = () => {
    setLoading(true);
    let dadosFiltrados = [];

    if (filtros.tipoRelatorio === "licitacoes" || filtros.tipoRelatorio === "ambos") {
      let licitacoesFiltradas = [...licitacoes];

      if (filtros.dataInicio) {
        licitacoesFiltradas = licitacoesFiltradas.filter((item) =>
          dayjs(item.data_abertura).isAfter(dayjs(filtros.dataInicio).subtract(1, "day"))
        );
      }

      if (filtros.dataFim) {
        licitacoesFiltradas = licitacoesFiltradas.filter((item) =>
          dayjs(item.data_abertura).isBefore(dayjs(filtros.dataFim).add(1, "day"))
        );
      }

      if (filtros.modalidade) {
        licitacoesFiltradas = licitacoesFiltradas.filter((item) =>
          item.modalidade?.toLowerCase().includes(filtros.modalidade.toLowerCase())
        );
      }

      if (filtros.status) {
        licitacoesFiltradas = licitacoesFiltradas.filter((item) =>
          item.status?.toLowerCase().includes(filtros.status.toLowerCase())
        );
      }

      licitacoesFiltradas.forEach((item) => {
        dadosFiltrados.push({
          ...item,
          tipo: "Licitação",
          numero: item.numero_processo,
          descricao: item.objeto,
          orgao: item.orgao_responsavel,
          data: item.data_abertura,
          valor: item.valor_estimado || "N/A",
        });
      });
    }

    if (filtros.tipoRelatorio === "contratos" || filtros.tipoRelatorio === "ambos") {
      let contratosFiltrados = [...contratos];

      if (filtros.dataInicio) {
        contratosFiltrados = contratosFiltrados.filter((item) =>
          dayjs(item.data_assinatura).isAfter(dayjs(filtros.dataInicio).subtract(1, "day"))
        );
      }

      if (filtros.dataFim) {
        contratosFiltrados = contratosFiltrados.filter((item) =>
          dayjs(item.data_assinatura).isBefore(dayjs(filtros.dataFim).add(1, "day"))
        );
      }

      if (filtros.status) {
        contratosFiltrados = contratosFiltrados.filter((item) =>
          item.status?.toLowerCase().includes(filtros.status.toLowerCase())
        );
      }

      contratosFiltrados.forEach((item) => {
        dadosFiltrados.push({
          ...item,
          tipo: "Contrato",
          numero: item.numero_contrato,
          descricao: item.objeto,
          orgao: item.orgao_responsavel,
          data: item.data_assinatura,
          valor: item.valor_contrato || item.valor_total || "N/A",
        });
      });
    }

    dadosFiltrados.sort((a, b) => dayjs(b.data).diff(dayjs(a.data)));

    setDadosRelatorio(dadosFiltrados);
    setRelatorioGerado(true);
    setLoading(false);
  };

  const gerarPDF = async () => {
    try {
      if (!dadosRelatorio || dadosRelatorio.length === 0) {
        alert("Nenhum dado encontrado para gerar o relatório.");
        return;
      }

      let PDF;
      try {
        PDF = new jsPDF();
      } catch {
        const jsPDFModule = await import("jspdf");
        PDF = new jsPDFModule.jsPDF();
      }

      PDF.setFont("helvetica");
      PDF.setFontSize(20);
      PDF.setFont("helvetica", "bold");
      PDF.text("RELATÓRIO COMPLETO DE PROCESSOS", 105, 20, { align: "center" });

      PDF.setFontSize(14);
      PDF.setFont("helvetica", "normal");
      PDF.text("Sistema de Licitações e Contratos - SALC", 105, 30, { align: "center" });

      const dataAtual = dayjs().format("DD/MM/YYYY HH:mm");
      PDF.setFontSize(10);
      PDF.text(`Data de geração: ${dataAtual}`, 20, 45);
      PDF.text(`Total de registros: ${dadosRelatorio.length}`, 20, 52);

      let filtrosAtivos = [];
      if (filtros.tipoRelatorio !== "ambos") filtrosAtivos.push(`Tipo: ${filtros.tipoRelatorio}`);
      if (filtros.modalidade) filtrosAtivos.push(`Modalidade: ${filtros.modalidade}`);
      if (filtros.status) filtrosAtivos.push(`Status: ${filtros.status}`);
      if (filtros.dataInicio) filtrosAtivos.push(`De: ${dayjs(filtros.dataInicio).format("DD/MM/YYYY")}`);
      if (filtros.dataFim) filtrosAtivos.push(`Até: ${dayjs(filtros.dataFim).format("DD/MM/YYYY")}`);

      if (filtrosAtivos.length > 0) {
        PDF.text(`Filtros aplicados: ${filtrosAtivos.join(" | ")}`, 20, 59);
      }

      PDF.line(20, 65, 190, 65);

      let yPosition = 75;

      const addNewPage = () => {
        PDF.addPage();
        yPosition = 20;
      };

      const checkPageSpace = (requiredSpace) => {
        if (yPosition + requiredSpace > 250) {
          addNewPage();
        }
      };

      dadosRelatorio.forEach((item, index) => {
        checkPageSpace(50);

        PDF.setFontSize(12);
        PDF.setFont("helvetica", "bold");
        PDF.text(`${index + 1}. ${item.tipo.toUpperCase()}`, 20, yPosition);
        yPosition += 8;

        const startY = yPosition - 3;

        PDF.setFont("helvetica", "normal");
        PDF.setFontSize(9);

        if (item.numero) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Número:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(String(item.numero), 50, yPosition);
          yPosition += 5;
        }

        if (item.descricao) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Descrição/Objeto:", 25, yPosition);
          yPosition += 5;
          PDF.setFont("helvetica", "normal");

          const splitText = PDF.splitTextToSize(String(item.descricao), 150);
          PDF.text(splitText, 25, yPosition);
          yPosition += splitText.length * 5;
        }

        if (item.orgao) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Órgão Responsável:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(String(item.orgao), 70, yPosition);
          yPosition += 5;
        }

        if (item.modalidade) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Modalidade:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(String(item.modalidade), 60, yPosition);
          yPosition += 5;
        }

        if (item.data) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Data:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(formatDate(item.data), 45, yPosition);
          yPosition += 5;
        }

        if (item.fornecedor) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Fornecedor:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(String(item.fornecedor), 60, yPosition);
          yPosition += 5;
        }

        if (item.status) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Status:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(String(item.status), 50, yPosition);
          yPosition += 5;
        }

        if (item.valor) {
          PDF.setFont("helvetica", "bold");
          PDF.text("Valor:", 25, yPosition);
          PDF.setFont("helvetica", "normal");
          PDF.text(formatCurrencyValue(item.valor), 45, yPosition);
          yPosition += 5;
        }

        const endY = yPosition + 2;
        PDF.rect(22, startY, 166, endY - startY);

        yPosition += 10;
      });

      checkPageSpace(30);
      PDF.setFontSize(12);
      PDF.setFont("helvetica", "bold");
      PDF.text("RESUMO ESTATÍSTICO", 20, yPosition);
      yPosition += 10;

      PDF.setFontSize(10);
      PDF.setFont("helvetica", "normal");

      const totalLicitacoes = dadosRelatorio.filter((item) => item.tipo === "Licitação").length;
      const totalContratos = dadosRelatorio.filter((item) => item.tipo === "Contrato").length;

      PDF.text(`Total de Licitações: ${totalLicitacoes}`, 20, yPosition);
      yPosition += 6;
      PDF.text(`Total de Contratos: ${totalContratos}`, 20, yPosition);
      yPosition += 6;
      PDF.text(`Total Geral de Processos: ${dadosRelatorio.length}`, 20, yPosition);

      const totalPages = PDF.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        PDF.setPage(i);
        PDF.setFontSize(8);
        PDF.setFont("helvetica", "normal");
        PDF.text(`Relatório gerado em ${dataAtual} - Página ${i} de ${totalPages}`, 105, 285, {
          align: "center",
        });
        PDF.text("Sistema de Licitações e Contratos - SALC", 105, 292, { align: "center" });
      }

      const nomeArquivo = `relatorio_completo_processos_${dayjs().format("YYYYMMDD_HHmm")}.pdf`;

      try {
        PDF.save(nomeArquivo);
      } catch {
        const pdfBlob = PDF.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = nomeArquivo;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }

      alert("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert(`Erro ao gerar PDF: ${error.message}`);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      tipoRelatorio: "ambos",
      dataInicio: "",
      dataFim: "",
      modalidade: "",
      status: "",
    });
    setRelatorioGerado(false);
    setDadosRelatorio([]);
  };

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
          <Assessment />
          Relatórios
        </Typography>

        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
          Gere relatórios de licitações e contratos com filtros e exportação em PDF.
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <FilterList sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              fontWeight="bold"
              color="primary.main"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              Filtros do Relatório
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={filtros.tipoRelatorio}
                  onChange={(e) => handleFiltroChange("tipoRelatorio", e.target.value)}
                  label="Tipo de Relatório"
                >
                  <MenuItem value="ambos">Licitações e Contratos</MenuItem>
                  <MenuItem value="licitacoes">Apenas Licitações</MenuItem>
                  <MenuItem value="contratos">Apenas Contratos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Modalidade</InputLabel>
                <Select
                  value={filtros.modalidade}
                  onChange={(e) => handleFiltroChange("modalidade", e.target.value)}
                  label="Modalidade"
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
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange("status", e.target.value)}
                  label="Status"
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
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={aplicarFiltros}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
              sx={{
                py: { xs: 1.2, sm: 1.1 },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
              }}
            >
              {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>

            <Button variant="outlined" onClick={limparFiltros} disabled={loading}>
              Limpar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {relatorioGerado && (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              <Typography
                fontWeight="bold"
                color="primary.main"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                Resumo do Relatório
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={async () => {
                    try {
                      const { jsPDF } = await import("jspdf");
                      const doc = new jsPDF();
                      doc.text("TESTE PDF SIMPLES", 20, 20);
                      doc.text("Este é um teste básico de PDF", 20, 30);
                      doc.save("teste_simples.pdf");
                      alert("Teste PDF básico funcionou!");
                    } catch (error) {
                      alert("Erro no teste básico: " + error.message);
                      console.error(error);
                    }
                  }}
                  size="small"
                >
                  Teste PDF
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={gerarPDF}
                  startIcon={<PictureAsPdf />}
                  sx={{
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #ff5252 0%, #e53935 100%)",
                    },
                  }}
                >
                  Baixar PDF Completo
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "#e3f2fd",
                    borderRadius: 2,
                  }}
                >
                  <Description sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
                  <Typography fontWeight="bold" color="primary.main" sx={{ fontSize: "2rem" }}>
                    {dadosRelatorio.filter((item) => item.tipo === "Licitação").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Licitações
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "#e8f5e8",
                    borderRadius: 2,
                  }}
                >
                  <Work sx={{ fontSize: 40, color: "#388e3c", mb: 1 }} />
                  <Typography fontWeight="bold" color="success.main" sx={{ fontSize: "2rem" }}>
                    {dadosRelatorio.filter((item) => item.tipo === "Contrato").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contratos
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "#fff3e0",
                    borderRadius: 2,
                  }}
                >
                  <Assessment sx={{ fontSize: 40, color: "#f57c00", mb: 1 }} />
                  <Typography fontWeight="bold" color="warning.main" sx={{ fontSize: "2rem" }}>
                    {dadosRelatorio.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Processos
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filtros Aplicados:
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`Tipo: ${filtros.tipoRelatorio}`} size="small" color="primary" />
                {filtros.dataInicio && (
                  <Chip label={`Início: ${dayjs(filtros.dataInicio).format("DD/MM/YYYY")}`} size="small" />
                )}
                {filtros.dataFim && (
                  <Chip label={`Fim: ${dayjs(filtros.dataFim).format("DD/MM/YYYY")}`} size="small" />
                )}
                {filtros.modalidade && <Chip label={`Modalidade: ${filtros.modalidade}`} size="small" />}
                {filtros.status && <Chip label={`Status: ${filtros.status}`} size="small" />}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {relatorioGerado && dadosRelatorio.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              Dados do Relatório
            </Typography>
          </Box>

          {isMobile ? (
            <Stack spacing={2}>
              {dadosRelatorio.map((item, index) => (
                <Card key={index} sx={{ borderRadius: 3, boxShadow: 2 }}>
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
                          {item.numero || "Sem número"}
                        </Typography>

                        <Chip
                          label={item.tipo}
                          color={item.tipo === "Licitação" ? "primary" : "success"}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Descrição:</strong> {item.descricao || "N/A"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Órgão:</strong> {item.orgao || "N/A"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Data:</strong> {formatDate(item.data)}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={item.status || "N/A"}
                          size="small"
                          color={getStatusColor(item.status)}
                          variant="outlined"
                        />
                        {item.modalidade && (
                          <Chip label={item.modalidade} size="small" variant="outlined" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        <strong>Valor:</strong> {formatCurrencyValue(item.valor)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0, maxHeight: 600 }}>
                  <Table stickyHeader sx={{ minWidth: 1000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Tipo</strong></TableCell>
                        <TableCell><strong>Número</strong></TableCell>
                        <TableCell><strong>Descrição</strong></TableCell>
                        <TableCell><strong>Órgão</strong></TableCell>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Valor</strong></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {dadosRelatorio.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip
                              label={item.tipo}
                              color={item.tipo === "Licitação" ? "primary" : "success"}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>{item.numero || "N/A"}</TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>{item.descricao || "N/A"}</TableCell>
                          <TableCell>{item.orgao || "N/A"}</TableCell>
                          <TableCell>{formatDate(item.data)}</TableCell>

                          <TableCell>
                            <Chip
                              label={item.status || "N/A"}
                              size="small"
                              color={getStatusColor(item.status)}
                            />
                          </TableCell>

                          <TableCell>{formatCurrencyValue(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {relatorioGerado && dadosRelatorio.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum processo encontrado com os filtros aplicados.
        </Alert>
      )}
    </Box>
  );
};

export default Relatorios;