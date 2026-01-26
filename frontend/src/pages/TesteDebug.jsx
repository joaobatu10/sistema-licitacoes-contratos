import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

const TesteDebug = () => {
  const [logs, setLogs] = useState([]);
  const [token, setToken] = useState(null);

  const log = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp} - ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      log(`Token encontrado no localStorage: ${savedToken.substring(0, 50)}...`);
    } else {
      log('Nenhum token encontrado no localStorage');
    }
  }, []);

  const fazerLogin = async () => {
    log('🔄 Iniciando processo de login...');
    
    try {
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', '123456');
      
      log('📤 Enviando requisição de login...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {

        method: 'POST',
        body: formData
      });
      
      log(`📊 Status do login: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        
        log(`🎫 Token recebido: ${newToken.substring(0, 50)}...`);
        
        // Salvar no state e localStorage
        setToken(newToken);
        localStorage.setItem('token', newToken);
        
        log('💾 Token salvo no localStorage');
        
        // Verificar se foi salvo corretamente
        const verificacao = localStorage.getItem('token');
        log(`🔍 Verificação localStorage: ${verificacao ? 'SUCESSO' : 'FALHOU'}`);
        
      } else {
        const errorText = await response.text();
        log(`❌ Erro no login: ${errorText}`);
      }
    } catch (error) {
      log(`💥 Exceção no login: ${error.message}`);
    }
  };

  const criarLicitacao = async () => {
    if (!token) {
      log('⚠️ Nenhum token disponível. Faça login primeiro.');
      return;
    }
    
    log('🔄 Iniciando criação de licitação...');
    
    // Verificar token no localStorage antes de enviar
    const tokenAtual = localStorage.getItem('token');
    log(`🔍 Token no localStorage antes da requisição: ${tokenAtual ? 'EXISTE' : 'NÃO EXISTE'}`);
    
    if (tokenAtual !== token) {
      log('⚠️ PROBLEMA: Token no state diferente do localStorage!');
      log(`   - State: ${token.substring(0, 30)}...`);
      log(`   - localStorage: ${tokenAtual ? tokenAtual.substring(0, 30) + '...' : 'NULL'}`);
    }

    const licitacaoData = {
      numero_processo: "2024/DEBUG001",
      modalidade: "Pregão Eletrônico", 
      objeto: "Teste debug React",
      orgao_responsavel: "Secretaria Debug",
      data_abertura: "2024-10-21",
      status: "Aberto"
    };
    
    log(`📋 Dados a enviar: ${JSON.stringify(licitacaoData)}`);
    
    try {
      log('📤 Enviando via api.js...');
      const response = await api.post('/licitacoes/', licitacaoData);
      
      log(`✅ SUCESSO! Status: ${response.status}`);
      log(`📋 Dados retornados: ${JSON.stringify(response.data)}`);
      
    } catch (error) {
      log(`❌ ERRO na criação:`);
      log(`   - Status: ${error.response?.status}`);
      log(`   - Mensagem: ${error.response?.data}`);
      log(`   - Headers: ${JSON.stringify(error.response?.headers)}`);
      
      // Verificar se o token ainda existe após o erro
      const tokenAposErro = localStorage.getItem('token');
      log(`🔍 Token após erro: ${tokenAposErro ? 'AINDA EXISTE' : 'FOI REMOVIDO'}`);
    }
  };

  const verificarToken = () => {
    const tokenLS = localStorage.getItem('token');
    log(`🔍 Verificação manual do token:`);
    log(`   - No state: ${token ? token.substring(0, 50) + '...' : 'NULL'}`);
    log(`   - No localStorage: ${tokenLS ? tokenLS.substring(0, 50) + '...' : 'NULL'}`);
    log(`   - São iguais: ${token === tokenLS}`);
  };

  const limparLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Debug - Teste de Licitação</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={fazerLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔑 Fazer Login
        </button>
        
        <button 
          onClick={criarLicitacao}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!token}
        >
          📝 Criar Licitação
        </button>
        
        <button 
          onClick={verificarToken}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          🔍 Verificar Token
        </button>
        
        <button 
          onClick={limparLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          🗑️ Limpar Logs
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        <h3 className="font-bold mb-2">📋 Logs de Debug:</h3>
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TesteDebug;