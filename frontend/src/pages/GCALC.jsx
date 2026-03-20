import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Grid, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, FormGroup, FormControlLabel,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SortIcon from '@mui/icons-material/Sort';
import api from '../services/api';

const GCALC = () => {
  const [licitacoesGcalc, setLicitacoesGcalc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [orgaoFilter, setOrgaoFilter] = useState(''); // Novo filtro por órgão responsável
  const [filters, setFilters] = useState({
    ad3: false,
    gac27: false,
    easa: false
  });

  const quarteis = [
    { key: 'ad3', label: 'AD/3', field: 'quartel_ad3', orgao: 'AD/3' },
    { key: 'gac27', label: '27 GAC', field: 'quartel_27gac', orgao: '27 GAC' },
    { key: 'easa', label: 'EASA', field: 'quartel_easa', orgao: 'EASA' }
  ];

  useEffect(() => {
    fetchLicitacoesGcalc();
  }, []);

  const fetchLicitacoesGcalc = async () => {
    try {
      setLoading(true);
      const response = await api.get('/licitacoes/');

  const gcalcLicitacoes = response.data.filter((licitacao) =>
  licitacao.is_gcalc ||
  licitacao.quartel_ad3 ||
  licitacao.quartel_27gac ||
  licitacao.quartel_easa
);

setLicitacoesGcalc(gcalcLicitacoes);
    } catch (error) {
      console.error('Erro ao buscar licitações GCALC:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aberta': return 'success';
      case 'fechada': return 'error';
      case 'em andamento': return 'warning';
      default: return 'default';
    }
  };

  const getQuarteisParticipantes = (licitacao) => {
    const participantes = [];
    if (licitacao.quartel_ad3) participantes.push('AD/3');
    if (licitacao.quartel_27gac) participantes.push('27 GAC');
    if (licitacao.quartel_easa) participantes.push('EASA');
    return participantes;
  };

  // Função para ordenar licitações por órgão responsável
  const sortByOrgao = (licitacoes) => {
    return [...licitacoes].sort((a, b) => {
      const orgaoA = a.orgao_responsavel || '';
      const orgaoB = b.orgao_responsavel || '';
      
      // Ordem de prioridade: AD/3, 27 GAC, EASA, outros
      const prioridade = {
        'AD/3': 1,
        '27 GAC': 2,
        '29º GAC AP': 2, // Mesmo grupo do 27 GAC
        'EASA': 3
      };
      
      const prioridadeA = prioridade[orgaoA] || 999;
      const prioridadeB = prioridade[orgaoB] || 999;
      
      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }
      
      // Se mesma prioridade, ordenar alfabeticamente
      return orgaoA.localeCompare(orgaoB);
    });
  };

  const filteredLicitacoes = sortByOrgao(licitacoesGcalc.filter(licitacao => {
    const matchesSearch = 
      licitacao.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licitacao.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licitacao.orgao_responsavel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      (!filters.ad3 || licitacao.quartel_ad3) &&
      (!filters.gac27 || licitacao.quartel_27gac) &&
      (!filters.easa || licitacao.quartel_easa);

    // Novo filtro por órgão responsável
    const matchesOrgao = !orgaoFilter || 
      licitacao.orgao_responsavel?.toLowerCase().includes(orgaoFilter.toLowerCase());

    return matchesSearch && matchesFilter && matchesOrgao;
  }));

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked
    });
  };

  const clearFilters = () => {
    setFilters({
      ad3: false,
      gac27: false,
      easa: false
    });
    setOrgaoFilter(''); // Limpar também o filtro de órgão
  };

  const handleTotalClick = () => {
    setOrgaoFilter(''); // Sempre mostra todos
  };

  const handleOrgaoClick = (orgao) => {
    setOrgaoFilter(orgaoFilter === orgao ? '' : orgao); // Toggle do filtro
  };

  const getActiveFiltersCount = () => {
    const filterCount = Object.values(filters).filter(Boolean).length;
    const orgaoCount = orgaoFilter ? 1 : 0;
    return filterCount + orgaoCount;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Carregando licitações GCALC...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupWorkIcon sx={{ mr: 2, color: 'primary.main' }} />
          GCALC - Licitações Colaborativas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerenciamento de licitações com participação de múltiplos quartéis
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: orgaoFilter === '' ? 2 : 1,
              borderColor: orgaoFilter === '' ? 'primary.main' : 'divider',
              backgroundColor: orgaoFilter === '' ? 'primary.light' : 'background.paper',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 3
              }
            }}
            onClick={() => handleTotalClick()}
          >
            <CardContent>
              <Typography 
                variant="h6"
                color={orgaoFilter === '' ? 'primary.contrastText' : 'text.primary'}
              >
                {licitacoesGcalc.length}
              </Typography>
              <Typography 
                variant="body2" 
                color={orgaoFilter === '' ? 'primary.contrastText' : 'text.secondary'}
              >
                Total GCALC
                {orgaoFilter === '' && ' (Todos)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {quarteis.map(quartel => {
          const count = licitacoesGcalc.filter(l => l[quartel.field]).length;
          const isActive = orgaoFilter === quartel.orgao;
          return (
            <Grid item xs={12} md={3} key={quartel.key}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: isActive ? 2 : 1,
                  borderColor: isActive ? 'primary.main' : 'divider',
                  backgroundColor: isActive ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleOrgaoClick(quartel.orgao)}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    color={isActive ? 'primary.contrastText' : 'text.primary'}
                  >
                    {count}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={isActive ? 'primary.contrastText' : 'text.secondary'}
                  >
                    {quartel.label}
                    {isActive && ' (Filtrado)'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Indicador de filtro ativo */}
      {orgaoFilter !== null && orgaoFilter !== '' && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" color="primary.contrastText">
              🔍 Mostrando apenas licitações do órgão: <strong>{orgaoFilter}</strong>
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="small"
              onClick={() => setOrgaoFilter('')}
            >
              Limpar Filtro
            </Button>
          </Box>
        </Box>
      )}

      {/* Indicador quando mostra todos */}
      {orgaoFilter === '' && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body1" color="success.contrastText">
            📋 Mostrando <strong>todas as licitações GCALC</strong> ({licitacoesGcalc.length} total)
          </Typography>
        </Box>
      )}

      {/* Controles de busca e filtro */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por processo, objeto ou órgão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
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
          color={getActiveFiltersCount() > 0 ? 'primary' : 'inherit'}
        >
          Filtros {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>
      </Box>

      {/* Informação sobre ordenação */}
      <Box sx={{ mb: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SortIcon fontSize="small" />
          Licitações ordenadas por quartel: AD/3 → 27 GAC → EASA → Outros
        </Typography>
      </Box>

      {/* Tabela de licitações */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Processo</TableCell>
              <TableCell>Modalidade</TableCell>
              <TableCell>Objeto</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
            {filteredLicitacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {searchTerm || getActiveFiltersCount() > 0 
                      ? 'Nenhuma licitação encontrada com os filtros aplicados'
                      : 'Nenhuma licitação GCALC cadastrada'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLicitacoes.map((licitacao) => (
                <TableRow key={licitacao.id_licitacao} hover>
                  <TableCell>{licitacao.numero_processo}</TableCell>
                  <TableCell>{licitacao.modalidade}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={licitacao.objeto}
                    >
                      {licitacao.objeto}
                    </Typography>
                  </TableCell>
                  <TableCell>{licitacao.orgao_responsavel}</TableCell>
                  <TableCell>
                    {new Date(licitacao.data_abertura).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={licitacao.status} 
                      color={getStatusColor(licitacao.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de filtros */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Filtrar por Quartéis
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione os quartéis para filtrar as licitações:
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FormGroup>
            {quarteis.map(quartel => (
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
        <DialogActions>
          <Button onClick={clearFilters}>Limpar</Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GCALC;