import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import api from "../services/api";
import {
  PictureAsPdf,
  Assessment,
  Description,
  Work,
  FilterList,
  Download
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

const Relatorios = () => {
  const [licitacoes, setLicitacoes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoRelatorio: 'ambos', // 'licitacoes', 'contratos', 'ambos'
    dataInicio: '',
    dataFim: '',
    modalidade: '',
    status: ''
  });
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);

  const modalidades = [
    "Pregão",
    "Dispensa Eletrônica", 
    "Dispensa Direta",
    "Inexigibilidade"
  ];

  const statusOptions = [
    "Em andamento",
    "Concluído",
    "Cancelado",
    "Suspenso"
  ];

  const fetchLicitacoes = async () => {
    try {
      console.log("🔍 Buscando licitações para relatórios...");
      const response = await api.get("/licitacoes/");
      setLicitacoes(response.data);
    } catch (error) {
      console.error("❌ Erro ao buscar licitações:", error);
    }
  };

  const fetchContratos = async () => {
    try {
      console.log("🔍 Buscando contratos para relatórios...");
      const response = await api.get("/contratos/");
      setContratos(response.data);
    } catch (error) {
      console.error("❌ Erro ao buscar contratos:", error);
    }
  };

  useEffect(() => {
    fetchLicitacoes();
    fetchContratos();
    
    // Debug: verificar se as listas de opções estão carregadas
    console.log('Modalidades disponíveis:', modalidades);
    console.log('Status disponíveis:', statusOptions);
    console.log('Filtros atuais:', filtros);
  }, []);

  // Monitorar mudanças nos filtros
  useEffect(() => {
    console.log('Filtros atualizados:', filtros);
  }, [filtros]);

  const handleFiltroChange = (field, value) => {
    console.log(`Alterando filtro ${field} para:`, value);
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const aplicarFiltros = () => {
    setLoading(true);
    let dadosFiltrados = [];

    // Filtrar licitações
    if (filtros.tipoRelatorio === 'licitacoes' || filtros.tipoRelatorio === 'ambos') {
      let licitacoesFiltradas = [...licitacoes];

      if (filtros.dataInicio) {
        licitacoesFiltradas = licitacoesFiltradas.filter(item => 
          dayjs(item.data_abertura).isAfter(dayjs(filtros.dataInicio).subtract(1, 'day'))
        );
      }

      if (filtros.dataFim) {
        licitacoesFiltradas = licitacoesFiltradas.filter(item => 
          dayjs(item.data_abertura).isBefore(dayjs(filtros.dataFim).add(1, 'day'))
        );
      }

      if (filtros.modalidade) {
        licitacoesFiltradas = licitacoesFiltradas.filter(item => 
          item.modalidade?.toLowerCase().includes(filtros.modalidade.toLowerCase())
        );
      }

      if (filtros.status) {
        licitacoesFiltradas = licitacoesFiltradas.filter(item => 
          item.status?.toLowerCase().includes(filtros.status.toLowerCase())
        );
      }

      licitacoesFiltradas.forEach(item => {
        dadosFiltrados.push({
          ...item,
          tipo: 'Licitação',
          numero: item.numero_processo,
          descricao: item.objeto,
          orgao: item.orgao_responsavel,
          data: item.data_abertura,
          valor: item.valor_estimado || 'N/A'
        });
      });
    }

    // Filtrar contratos
    if (filtros.tipoRelatorio === 'contratos' || filtros.tipoRelatorio === 'ambos') {
      let contratosFiltrados = [...contratos];

      if (filtros.dataInicio) {
        contratosFiltrados = contratosFiltrados.filter(item => 
          dayjs(item.data_assinatura).isAfter(dayjs(filtros.dataInicio).subtract(1, 'day'))
        );
      }

      if (filtros.dataFim) {
        contratosFiltrados = contratosFiltrados.filter(item => 
          dayjs(item.data_assinatura).isBefore(dayjs(filtros.dataFim).add(1, 'day'))
        );
      }

      if (filtros.status) {
        contratosFiltrados = contratosFiltrados.filter(item => 
          item.status?.toLowerCase().includes(filtros.status.toLowerCase())
        );
      }

      contratosFiltrados.forEach(item => {
        dadosFiltrados.push({
          ...item,
          tipo: 'Contrato',
          numero: item.numero_contrato,
          descricao: item.objeto,
          orgao: item.orgao_responsavel,
          data: item.data_assinatura,
          valor: item.valor_contrato || 'N/A'
        });
      });
    }

    // Ordenar por data
    dadosFiltrados.sort((a, b) => dayjs(b.data).diff(dayjs(a.data)));

    setDadosRelatorio(dadosFiltrados);
    setRelatorioGerado(true);
    setLoading(false);
  };

  const gerarPDF = async () => {
    try {
      console.log('Iniciando geração do PDF completo...');
      
      if (!dadosRelatorio || dadosRelatorio.length === 0) {
        alert('Nenhum dado encontrado para gerar o relatório. Por favor, execute a busca primeiro.');
        return;
      }

      // Importação dinâmica como fallback
      let PDF;
      try {
        PDF = new jsPDF();
      } catch (e1) {
        try {
          const jsPDFModule = await import('jspdf');
          PDF = new jsPDFModule.jsPDF();
        } catch (e2) {
          throw new Error('Não foi possível carregar a biblioteca jsPDF');
        }
      }

      console.log('jsPDF carregado com sucesso');

      // Configurações do documento
      PDF.setFont('helvetica');
      
      // Cabeçalho
      PDF.setFontSize(20);
      PDF.setFont('helvetica', 'bold');
      PDF.text('RELATÓRIO COMPLETO DE PROCESSOS', 105, 20, { align: 'center' });
      
      PDF.setFontSize(14);
      PDF.setFont('helvetica', 'normal');
      PDF.text('Sistema de Licitações e Contratos - SALC', 105, 30, { align: 'center' });
      
      // Informações do relatório
      const dataAtual = dayjs().format('DD/MM/YYYY HH:mm');
      PDF.setFontSize(10);
      PDF.text(`Data de geração: ${dataAtual}`, 20, 45);
      PDF.text(`Total de registros: ${dadosRelatorio.length}`, 20, 52);
      
      // Filtros aplicados
      let filtrosAtivos = [];
      if (filtros.tipoRelatorio !== 'ambos') filtrosAtivos.push(`Tipo: ${filtros.tipoRelatorio}`);
      if (filtros.modalidade) filtrosAtivos.push(`Modalidade: ${filtros.modalidade}`);
      if (filtros.status) filtrosAtivos.push(`Status: ${filtros.status}`);
      if (filtros.dataInicio) filtrosAtivos.push(`De: ${dayjs(filtros.dataInicio).format('DD/MM/YYYY')}`);
      if (filtros.dataFim) filtrosAtivos.push(`Até: ${dayjs(filtros.dataFim).format('DD/MM/YYYY')}`);
      
      if (filtrosAtivos.length > 0) {
        PDF.text(`Filtros aplicados: ${filtrosAtivos.join(' | ')}`, 20, 59);
      }
      
      // Linha de separação
      PDF.line(20, 65, 190, 65);
      
      let yPosition = 75;
      let pageNumber = 1;
      
      // Função para adicionar nova página
      const addNewPage = () => {
        PDF.addPage();
        yPosition = 20;
        pageNumber++;
      };
      
      // Função para verificar espaço na página
      const checkPageSpace = (requiredSpace) => {
        if (yPosition + requiredSpace > 250) {
          addNewPage();
        }
      };
      
      // Processar cada item do relatório
      dadosRelatorio.forEach((item, index) => {
        checkPageSpace(50); // Verificar se há espaço suficiente
        
        // Cabeçalho do item
        PDF.setFontSize(12);
        PDF.setFont('helvetica', 'bold');
        PDF.text(`${index + 1}. ${item.tipo.toUpperCase()}`, 20, yPosition);
        yPosition += 8;
        
        // Caixa de contorno para cada processo
        const startY = yPosition - 3;
        
        PDF.setFont('helvetica', 'normal');
        PDF.setFontSize(9);
        
        // Informações básicas
        if (item.numero) {
          PDF.setFont('helvetica', 'bold');
          PDF.text('Número:', 25, yPosition);
          PDF.setFont('helvetica', 'normal');
          PDF.text(item.numero, 50, yPosition);
          yPosition += 5;
        }
        
        if (item.descricao) {
          PDF.setFont('helvetica', 'bold');
          PDF.text('Descrição/Objeto:', 25, yPosition);
          yPosition += 5;
          PDF.setFont('helvetica', 'normal');
          
          // Quebrar texto longo
          const splitText = PDF.splitTextToSize(item.descricao, 150);
          PDF.text(splitText, 25, yPosition);
          yPosition += splitText.length * 5;
        }
        
        if (item.orgao) {
          PDF.setFont('helvetica', 'bold');
          PDF.text('Órgão Responsável:', 25, yPosition);
          PDF.setFont('helvetica', 'normal');
          PDF.text(item.orgao, 70, yPosition);
          yPosition += 5;
        }
        
        // Informações específicas por tipo
        if (item.tipo === 'Licitação') {
          // Campos específicos de licitação
          if (item.modalidade) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Modalidade:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(item.modalidade, 60, yPosition);
            yPosition += 5;
          }
          
          if (item.data_abertura) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Data de Abertura:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(dayjs(item.data_abertura).format('DD/MM/YYYY'), 70, yPosition);
            yPosition += 5;
          }
          
          if (item.data_encerramento) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Data de Encerramento:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(dayjs(item.data_encerramento).format('DD/MM/YYYY'), 80, yPosition);
            yPosition += 5;
          }
          
          if (item.valor_estimado) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Valor Estimado:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(`R$ ${item.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 65, yPosition);
            yPosition += 5;
          }
          
        } else if (item.tipo === 'Contrato') {
          // Campos específicos de contrato
          if (item.numero_contrato) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Número do Contrato:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(item.numero_contrato, 75, yPosition);
            yPosition += 5;
          }
          
          if (item.data_assinatura) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Data de Assinatura:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(dayjs(item.data_assinatura).format('DD/MM/YYYY'), 75, yPosition);
            yPosition += 5;
          }
          
          if (item.data_inicio) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Data de Início:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(dayjs(item.data_inicio).format('DD/MM/YYYY'), 65, yPosition);
            yPosition += 5;
          }
          
          if (item.data_fim) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Data de Fim:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(dayjs(item.data_fim).format('DD/MM/YYYY'), 60, yPosition);
            yPosition += 5;
          }
          
          if (item.valor_contrato) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Valor do Contrato:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(`R$ ${item.valor_contrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 70, yPosition);
            yPosition += 5;
          }
          
          if (item.fornecedor) {
            PDF.setFont('helvetica', 'bold');
            PDF.text('Fornecedor:', 25, yPosition);
            PDF.setFont('helvetica', 'normal');
            PDF.text(item.fornecedor, 60, yPosition);
            yPosition += 5;
          }
        }
        
        // Status
        if (item.status) {
          PDF.setFont('helvetica', 'bold');
          PDF.text('Status:', 25, yPosition);
          PDF.setFont('helvetica', 'normal');
          PDF.text(item.status, 50, yPosition);
          yPosition += 5;
        }
        
        // Observações se houver
        if (item.observacoes) {
          PDF.setFont('helvetica', 'bold');
          PDF.text('Observações:', 25, yPosition);
          yPosition += 5;
          PDF.setFont('helvetica', 'normal');
          const splitObs = PDF.splitTextToSize(item.observacoes, 150);
          PDF.text(splitObs, 25, yPosition);
          yPosition += splitObs.length * 5;
        }
        
        // Caixa de contorno
        const endY = yPosition + 2;
        PDF.rect(22, startY, 166, endY - startY);
        
        yPosition += 10; // Espaço entre processos
      });
      
      // Resumo final
      checkPageSpace(30);
      PDF.setFontSize(12);
      PDF.setFont('helvetica', 'bold');
      PDF.text('RESUMO ESTATÍSTICO', 20, yPosition);
      yPosition += 10;
      
      PDF.setFontSize(10);
      PDF.setFont('helvetica', 'normal');
      const totalLicitacoes = dadosRelatorio.filter(item => item.tipo === 'Licitação').length;
      const totalContratos = dadosRelatorio.filter(item => item.tipo === 'Contrato').length;
      
      PDF.text(`Total de Licitações: ${totalLicitacoes}`, 20, yPosition);
      yPosition += 6;
      PDF.text(`Total de Contratos: ${totalContratos}`, 20, yPosition);
      yPosition += 6;
      PDF.text(`Total Geral de Processos: ${dadosRelatorio.length}`, 20, yPosition);

      // Rodapé em todas as páginas
      const totalPages = PDF.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        PDF.setPage(i);
        PDF.setFontSize(8);
        PDF.setFont('helvetica', 'normal');
        PDF.text(`Relatório gerado em ${dataAtual} - Página ${i} de ${totalPages}`, 105, 285, { align: 'center' });
        PDF.text('Sistema de Licitações e Contratos - SALC', 105, 292, { align: 'center' });
      }

      // Salvar o PDF
      const nomeArquivo = `relatorio_completo_processos_${dayjs().format('YYYYMMDD_HHmm')}.pdf`;
      console.log('Tentando salvar PDF completo com nome:', nomeArquivo);
      
      // Método de download forçado
      try {
        PDF.save(nomeArquivo);
        console.log('PDF completo salvo usando doc.save()');
      } catch (saveError) {
        console.log('Erro com doc.save(), tentando método alternativo:', saveError);
        
        // Método alternativo usando blob
        const pdfBlob = PDF.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = nomeArquivo;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        console.log('PDF completo salvo usando método de blob');
      }
      
      alert(`PDF completo gerado com sucesso!\n\nContém informações detalhadas de ${dadosRelatorio.length} processos.\nO download deve começar automaticamente.`);
      console.log('PDF completo gerado e download iniciado com sucesso!');
      
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF completo:', error);
      alert(`Erro ao gerar PDF completo: ${error.message}\n\nVerifique o console do navegador para mais detalhes.`);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      tipoRelatorio: 'ambos',
      dataInicio: '',
      dataFim: '',
      modalidade: '',
      status: ''
    });
    setRelatorioGerado(false);
    setDadosRelatorio([]);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#1a202c' }}>
        <Assessment sx={{ mr: 2, verticalAlign: 'middle' }} />
        Relatórios
      </Typography>

      {/* Seção de Filtros */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterList sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" color="primary.main">
              Filtros do Relatório - Atualizado
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={filtros.tipoRelatorio}
                  onChange={(e) => handleFiltroChange('tipoRelatorio', e.target.value)}
                  label="Tipo de Relatório"
                >
                  <MenuItem value="ambos">Licitações e Contratos</MenuItem>
                  <MenuItem value="licitacoes">Apenas Licitações</MenuItem>
                  <MenuItem value="contratos">Apenas Contratos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="modalidade-select-label" shrink>Modalidade</InputLabel>
                <Select
                  labelId="modalidade-select-label"
                  id="modalidade-select"
                  value={filtros.modalidade}
                  onChange={(e) => handleFiltroChange('modalidade', e.target.value)}
                  label="Modalidade"
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: '#999', fontStyle: 'italic' }}>Todas as modalidades</span>;
                    }
                    return selected;
                  }}
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
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-select-label" shrink>Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  label="Status"
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: '#999', fontStyle: 'italic' }}>Todos os status</span>;
                    }
                    return selected;
                  }}
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

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={aplicarFiltros}
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
              startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>

            <Button
              variant="outlined"
              onClick={limparFiltros}
              disabled={loading}
            >
              Limpar Filtros
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Resumo do Relatório */}
      {relatorioGerado && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary.main">
                Resumo do Relatório
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    try {
                      const { jsPDF } = await import('jspdf');
                      const doc = new jsPDF();
                      doc.text('TESTE PDF SIMPLES', 20, 20);
                      doc.text('Este é um teste básico de PDF', 20, 30);
                      doc.save('teste_simples.pdf');
                      alert('Teste PDF básico funcionou!');
                    } catch (error) {
                      alert('Erro no teste básico: ' + error.message);
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
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff5252 0%, #e53935 100%)',
                    }
                  }}
                >
                  Baixar PDF Completo
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                  <Description sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {dadosRelatorio.filter(item => item.tipo === 'Licitação').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Licitações
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
                  <Work sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {dadosRelatorio.filter(item => item.tipo === 'Contrato').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contratos
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                  <Assessment sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {dadosRelatorio.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Processos
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Filtros Ativos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filtros Aplicados:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Tipo: ${filtros.tipoRelatorio}`} size="small" color="primary" />
                {filtros.dataInicio && (
                  <Chip label={`Início: ${dayjs(filtros.dataInicio).format('DD/MM/YYYY')}`} size="small" />
                )}
                {filtros.dataFim && (
                  <Chip label={`Fim: ${dayjs(filtros.dataFim).format('DD/MM/YYYY')}`} size="small" />
                )}
                {filtros.modalidade && (
                  <Chip label={`Modalidade: ${filtros.modalidade}`} size="small" />
                )}
                {filtros.status && (
                  <Chip label={`Status: ${filtros.status}`} size="small" />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados */}
      {relatorioGerado && dadosRelatorio.length > 0 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary.main">
              Dados do Relatório
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
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
                          color={item.tipo === 'Licitação' ? 'primary' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.numero || 'N/A'}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {item.descricao || 'N/A'}
                      </TableCell>
                      <TableCell>{item.orgao || 'N/A'}</TableCell>
                      <TableCell>{dayjs(item.data).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status || 'N/A'} 
                          size="small"
                          color={
                            item.status?.toLowerCase().includes('conclu') ? 'success' :
                            item.status?.toLowerCase().includes('cancel') ? 'error' :
                            'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {typeof item.valor === 'number' 
                          ? `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : item.valor
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {relatorioGerado && dadosRelatorio.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum processo encontrado com os filtros aplicados.
        </Alert>
      )}
    </Box>
  );
};

export default Relatorios;