# 🚨 INSTRUÇÕES FINAIS - TESTE MANUAL

## 🎯 PROBLEMA IDENTIFICADO:
O servidor está funcionando, mas há problemas de interrupção durante os testes automáticos.

## ✅ SOLUÇÃO: TESTE MANUAL PASSO A PASSO

### PASSO 1: INICIE O SERVIDOR MANUALMENTE
Abra um **novo terminal PowerShell** e execute:

```powershell
cd "c:\Users\cador\OneDrive\Documentos\Visual Studio 2022\FASTAPI\FASTAPI\backend"
$env:PYTHONPATH = "c:\Users\cador\OneDrive\Documentos\Visual Studio 2022\FASTAPI\FASTAPI\backend"
C:/Users/cador/anaconda3/Scripts/conda.exe run -p C:\Users\cador\anaconda3 --no-capture-output uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Aguarde até aparecer:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### PASSO 2: LIMPE OS TOKENS DO NAVEGADOR
1. Abra o navegador
2. Vá para: `file:///c:/Users/cador/OneDrive/Documentos/Visual%20Studio%202022/FASTAPI/FASTAPI/backend/limpar_tokens.html`
3. Clique em **"Limpar Tokens Antigos"**
4. Aguarde a confirmação

### PASSO 3: TESTE O LOGIN
1. Acesse: http://localhost:5174/login
2. Teste estas credenciais:

**ADMINISTRADOR:**
- Username: `admin`
- Password: `admin123`

**SE NÃO FUNCIONAR, TESTE:**
- Username: `admin`
- Password: `admin`

**USUÁRIO REGULAR:**
- Username: `cador`
- Password: `123456`

### PASSO 4: TESTE A FUNCIONALIDADE DE DELETE
Após fazer login com sucesso:

1. **Se logou como ADMIN:**
   - Vá para Contratos ou Licitações
   - Tente deletar um item
   - **DEVE FUNCIONAR** ✅

2. **Se logou como USUÁRIO:**
   - Vá para Contratos ou Licitações
   - Tente deletar um item
   - **DEVE DAR ERRO 403** (sem permissão) ✅

## 🔍 SE AINDA HOUVER PROBLEMAS:

### Caso 1: Erro de "Column 'role' not found"
Execute no terminal:
```powershell
cd "c:\Users\cador\OneDrive\Documentos\Visual Studio 2022\FASTAPI\FASTAPI\backend"
C:/Users/cador/anaconda3/Scripts/conda.exe run -p C:\Users\cador\anaconda3 --no-capture-output python fix_usuarios_table.py
```

### Caso 2: Login não funciona
- Verifique se o servidor está realmente rodando
- Confirme se limpou os tokens do navegador
- Teste as credenciais listadas acima

### Caso 3: Frontend não carrega
Execute em outro terminal:
```powershell
cd "c:\Users\cador\OneDrive\Documentos\Visual Studio 2022\FASTAPI\FASTAPI\frontend"
npm run dev
```

## 📊 STATUS ESPERADO:
- ✅ Servidor: http://127.0.0.1:8000
- ✅ Frontend: http://localhost:5174
- ✅ Login: admin/admin123 ou admin/admin
- ✅ Delete: Só funciona para admin
- ✅ Usuários regulares: Apenas leitura

## 🎯 RESULTADO ESPERADO:
**O sistema deve funcionar 100% após seguir estes passos manualmente!**

Execute cada passo com cuidado e me informe o resultado!