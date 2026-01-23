import { useState } from "react";

const CadastroLicitacaoSimples = () => {
  const [formData, setFormData] = useState({
    numero_processo: "",
    modalidade: "",
    objeto: "",
    orgao_responsavel: "",
    data_abertura: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    console.log("🚀 INICIANDO CADASTRO SIMPLES...");
    
    try {
      // 1. Primeiro, fazer login para garantir token válido
      console.log("🔑 1. Fazendo login...");
      
      const loginData = new FormData();
      loginData.append('username', 'admin');
      loginData.append('password', '123456');
      
      const loginResponse = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        body: loginData
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Erro no login: ${loginResponse.status}`);
      }
      
      const { access_token } = await loginResponse.json();
      console.log(`✅ Token obtido: ${access_token.substring(0, 50)}...`);
      
      // 2. Salvar token no localStorage
      localStorage.setItem('token', access_token);
      
      // 3. Criar licitação IMEDIATAMENTE após login
      console.log("📝 2. Criando licitação...");
      
      const licitacaoResponse = await fetch('http://127.0.0.1:8000/licitacoes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log(`📊 Status criação: ${licitacaoResponse.status}`);
      
      if (licitacaoResponse.ok) {
        const result = await licitacaoResponse.json();
        console.log(`✅ Sucesso: ${JSON.stringify(result)}`);
        
        setMessage(`✅ Licitação criada com sucesso! ID: ${result.id_licitacao}`);
        
        // Limpar formulário
        setFormData({
          numero_processo: "",
          modalidade: "",
          objeto: "",
          orgao_responsavel: "",
          data_abertura: "",
          status: "",
        });
        
      } else {
        const errorText = await licitacaoResponse.text();
        console.error(`❌ Erro na criação: ${errorText}`);
        setMessage(`❌ Erro: ${licitacaoResponse.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error(`💥 Exceção: ${error.message}`);
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">🚀 Cadastro Simples de Licitação</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
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
          placeholder="Modalidade (ex: Pregão Eletrônico)"
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
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '🔄 Cadastrando...' : '📝 Cadastrar Licitação'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <strong>ℹ️ Como funciona:</strong>
        <br />• Faz login automático com admin/123456
        <br />• Usa token fresco para cada cadastro
        <br />• Não depende de interceptors ou localStorage
      </div>
    </div>
  );
};

export default CadastroLicitacaoSimples;