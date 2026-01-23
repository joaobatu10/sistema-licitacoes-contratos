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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Assignment,
  Description,
  AttachMoney,
  CalendarToday,
  Business,
  FilterList,
  Visibility,
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

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Buscando licitações e contratos...");
      
      const [licsResponse, consResponse] = await Promise.all([
        api.get("/licitacoes/"),
        api.get("/contratos/").catch(() => ({ data: [] }))
      ]);
      
      console.log("✅ Dados carregados:");
      console.log("Licitações:", licsResponse.data);
      console.log("Contratos:", consResponse.data);
      
      setLicitacoes(licsResponse.data || []);
      setContratos(consResponse.data || []);
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);
      
      if (error.response?.status === 401) {
        setError("Você precisa estar logado para visualizar os processos");
        localStorage.removeItem('token');
        window.location.href = '/login';
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
    if (value === null || value === undefined) return "R$ 0,00";
    
    // Converter para número se for string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusColor = (status, type) => {
    const statusColors = {
      licitacao: {
        "Aberta": "primary",
        "Em andamento": "warning", 
        "Encerrada": "success",
        "Cancelada": "error",
        "Homologado": "info"
      },
      contrato: {
        "Ativo": "success",
        "Inativo": "error",
        "Suspenso": "warning",
        "Finalizado": "info"
      }
    };
    
    return statusColors[type]?.[status] || "default";
  };

  const filteredLicitacoes = licitacoes.filter(item =>
    searchTerm === "" || 
    item.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orgao_responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modalidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContratos = contratos.filter(item =>
    searchTerm === "" || 
    item.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
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

  const LicitacoesTable = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                  Nenhuma licitação encontrada
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredLicitacoes.map((licitacao, index) => (
              <TableRow 
                key={licitacao.id_licitacao} 
                hover
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
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
                  <Tooltip title={licitacao.objeto}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    color={getStatusColor(licitacao.status, 'licitacao')}
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
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                  Nenhum contrato encontrado
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredContratos.map((contrato, index) => (
              <TableRow 
                key={contrato.id} 
                hover
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#e8f5e8' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main', fontSize: '0.8rem' }}>
                      C
                    </Avatar>
                    <Typography variant="body2" fontWeight="bold">
                      {contrato.numero_contrato}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2">
                      {contrato.fornecedor}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title={contrato.objeto}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {contrato.objeto}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="success" />
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatCurrency(contrato.valor_total)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="warning" />
                    <Typography variant="body2" color="warning.main">
                      {contrato.valor_parcela_mensal ? formatCurrency(contrato.valor_parcela_mensal) : "-"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    color={getStatusColor(contrato.status, 'contrato')}
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Processos
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {licitacoes.length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Licitações Cadastradas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e8 0%, #fff 100%)' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {contratos.length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Contratos Cadastrados
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fff3e0 0%, #fff 100%)' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {licitacoes.length + contratos.length}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Total de Processos
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Pesquisar por número do processo, objeto, órgão, modalidade, fornecedor..."
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {searchTerm && (
                <>
                  Resultados para "{searchTerm}": {filteredLicitacoes.length + filteredContratos.length} processo(s)
                </>
              )}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
            >
              Limpar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Gavel />
                  Licitações ({filteredLicitacoes.length})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description />
                  Contratos ({filteredContratos.length})
                </Box>
              } 
            />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {tabValue === 0 && <LicitacoesTable />}
          {tabValue === 1 && <ContratosTable />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Processos;