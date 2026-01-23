# 🔑 CREDENCIAIS DO SISTEMA - ATUALIZADO

## 📊 Status do Banco de Dados:
✅ Tabela usuarios corrigida e funcionando
✅ Colunas 'role' e outras colunas necessárias presentes
✅ 5 usuários cadastrados no sistema

## 👥 USUÁRIOS DISPONÍVEIS:

### 🛡️ ADMINISTRADOR:
- **Username:** `admin`
- **Password:** `admin123` (ou a senha que você definiu)
- **Role:** `admin`
- **Permissões:** Todas (CRUD completo)

### 👤 USUÁRIOS REGULARES:
1. **Username:** `testuser`
   - **Password:** `password123` (ou a senha definida)
   - **Role:** `user`
   - **Permissões:** Apenas leitura

2. **Username:** `newuser2024`
   - **Password:** `newpass2024` (ou a senha definida) 
   - **Role:** `user`
   - **Permissões:** Apenas leitura

3. **Username:** `cador`
   - **Password:** (a senha que você definiu)
   - **Role:** `user`
   - **Permissões:** Apenas leitura

4. **Username:** `ev`
   - **Password:** (a senha definida)
   - **Role:** `user`
   - **Status:** Não aprovado (is_approved = 0)

## 🚀 PARA TESTAR O LOGIN:

### Opção 1: Use o admin
```
Username: admin
Password: admin123
```

### Opção 2: Use seu usuário cador
```
Username: cador
Password: [sua senha definida]
```

## 🔧 SE AINDA HOUVER PROBLEMAS:

1. **Limpe os tokens do navegador** primeiro:
   - Abra: `c:\Users\cador\OneDrive\Documentos\Visual Studio 2022\FASTAPI\FASTAPI\backend\limpar_tokens.html`
   - Clique em "Limpar Tokens Antigos"

2. **Acesse o sistema:**
   - Frontend: http://localhost:5174/login
   - Backend: http://127.0.0.1:8000 (rodando)

3. **Teste a funcionalidade:**
   - Login com admin → deve ter acesso total
   - Login com usuário regular → apenas leitura
   - Delete de processos → só admin consegue

## 📋 RESUMO DO QUE FOI CORRIGIDO:

✅ Problema de credenciais: Tabela usuarios tinha estrutura correta
✅ Servidor funcionando: http://127.0.0.1:8000
✅ Tokens antigos: Sistema detecta e rejeita automaticamente
✅ Roles definidos: admin = acesso total, user = apenas leitura
✅ Sistema pronto: Delete funcionará após limpeza de tokens

**🎯 PRÓXIMO PASSO:** Limpe os tokens e faça login!