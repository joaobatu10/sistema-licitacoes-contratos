import { useState } from "react";
import api from "../services/api.js";

const CadastroLicitacao = () => {
  const [formData, setFormData] = useState({
    numero_processo: "",
    modalidade: "",
    objeto: "",
    orgao_responsavel: "",
    data_abertura: "",
    data_encerramento: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se usuário está logado antes de tentar cadastrar
    const token = localStorage.getItem('token');
    console.log("🔍 Token encontrado:", token ? "SIM" : "NÃO");
    console.log("📋 Dados a serem enviados:", formData);
    
    if (!token) {
      alert("Você precisa estar logado para cadastrar licitações. Redirecionando para login...");
      window.location.href = '/login';
      return;
    }
    
    try {
      console.log("🚀 Enviando requisição para /licitacoes/...");
      
      // Preparar dados - remover campos vazios opcionais
      const dadosParaEnvio = { ...formData };
      if (!dadosParaEnvio.data_encerramento) {
        delete dadosParaEnvio.data_encerramento;
      }
      
      console.log("📋 Dados finais a serem enviados:", dadosParaEnvio);
      
      const response = await api.post("/licitacoes/", dadosParaEnvio);
      console.log("✅ Resposta recebida:", response.data);
      alert("Licitação cadastrada com sucesso!");
      setFormData({
        numero_processo: "",
        modalidade: "",
        objeto: "",
        orgao_responsavel: "",
        data_abertura: "",
        data_encerramento: "",
        status: "",
      });
    } catch (error) {
      console.error("❌ Erro completo:", error);
      console.error("📊 Status do erro:", error.response?.status);
      console.error("📝 Dados do erro:", error.response?.data);
      console.error("🔧 Headers do erro:", error.response?.headers);
      
      if (error.response?.status === 403) {
        alert("Erro: Você não tem permissão de administrador para cadastrar licitações.");
      } else if (error.response?.status === 401) {
        alert("Erro: Sessão expirada. Faça login novamente.");
      } else if (error.response?.status === 422) {
        alert(`Erro de validação: ${JSON.stringify(error.response?.data?.detail || 'Dados inválidos')}`);
      } else {
        alert("Erro ao cadastrar licitação. Tente novamente.");
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Cadastro de Licitação</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="numero_processo"
          placeholder="Número do Processo"
          value={formData.numero_processo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="modalidade"
          placeholder="Modalidade"
          value={formData.modalidade}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="objeto"
          placeholder="Objeto"
          value={formData.objeto}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="orgao_responsavel"
          placeholder="Órgão Responsável"
          value={formData.orgao_responsavel}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="data_abertura"
          placeholder="Data de Abertura"
          value={formData.data_abertura}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="data_encerramento"
          placeholder="Data de Encerramento (opcional)"
          value={formData.data_encerramento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecione o Status</option>
          <option value="Aberto">Aberto</option>
          <option value="Encerrado">Encerrado</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default CadastroLicitacao;