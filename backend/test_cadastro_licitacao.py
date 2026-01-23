#!/usr/bin/env python3
import requests
import json

def test_licitacao_cadastro():
    """Testa o cadastro de licitação"""
    
    base_url = "http://127.0.0.1:8000"
    
    # Primeiro, fazer login como admin
    print("🔑 Fazendo login como admin...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        login_response = requests.post(f"{base_url}/login", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.text}")
            # Tentar com senha alternativa
            login_data["password"] = "admin"
            login_response = requests.post(f"{base_url}/login", json=login_data)
            print(f"Login alternativo Status: {login_response.status_code}")
            
            if login_response.status_code != 200:
                print(f"❌ Erro no login alternativo: {login_response.text}")
                return
        
        # Obter token
        login_result = login_response.json()
        token = login_result.get("access_token")
        print(f"✅ Login realizado! Token: {token[:20]}...")
        
        # Headers com autenticação
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Dados da licitação de teste
        licitacao_data = {
            "numero_processo": f"TEST-{__import__('time').time():.0f}",
            "modalidade": "Pregão Eletrônico",
            "objeto": "Teste de cadastro de licitação",
            "orgao_responsavel": "Secretaria de Teste",
            "data_abertura": "2025-10-25",
            "status": "Aberto"
        }
        
        print(f"\n📝 Testando cadastro de licitação...")
        print(f"Dados: {json.dumps(licitacao_data, indent=2)}")
        
        # Tentar cadastrar licitação
        response = requests.post(f"{base_url}/licitacoes", json=licitacao_data, headers=headers)
        print(f"Cadastro Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Licitação cadastrada com sucesso!")
            print(f"ID: {result.get('id')}")
            print(f"Processo: {result.get('numero_processo')}")
        else:
            print(f"❌ Erro no cadastro: {response.text}")
            print(f"Headers enviados: {headers}")
        
        # Testar listagem
        print(f"\n📋 Testando listagem...")
        list_response = requests.get(f"{base_url}/licitacoes")
        print(f"Listagem Status: {list_response.status_code}")
        if list_response.status_code == 200:
            licitacoes = list_response.json()
            print(f"Total de licitações: {len(licitacoes)}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor. Verifique se está rodando!")
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_auth_endpoints():
    """Testa endpoints de autenticação"""
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Testando endpoints de autenticação...")
    
    # Testar usuários
    try:
        users_response = requests.get(f"{base_url}/usuarios")
        print(f"Usuários Status: {users_response.status_code}")
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"Total de usuários: {len(users)}")
            for user in users:
                print(f"  - {user.get('username')} (role: {user.get('role')})")
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")

if __name__ == "__main__":
    print("🚀 DIAGNÓSTICO DE CADASTRO DE LICITAÇÃO")
    print("="*50)
    
    test_auth_endpoints()
    print("\n" + "="*50)
    test_licitacao_cadastro()
    
    print("\n" + "="*50)
    print("✅ Teste concluído!")