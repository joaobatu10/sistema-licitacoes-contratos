import requests
import json

def test_login():
    """Testa o login com credenciais conhecidas"""
    url = "http://127.0.0.1:8000/login"
    
    # Teste com admin
    admin_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print("🔑 Testando login com admin...")
    
    try:
        response = requests.post(url, json=admin_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login admin SUCESSO!")
            print(f"Token: {data.get('access_token', 'N/A')[:20]}...")
            print(f"Usuario: {data.get('user', {}).get('username', 'N/A')}")
            print(f"Role: {data.get('user', {}).get('role', 'N/A')}")
        else:
            print("❌ Login admin FALHOU!")
            print(f"Erro: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
    
    # Teste com usuário regular
    user_data = {
        "username": "cador", 
        "password": "123456"  # Senha comum de teste
    }
    
    print("\n🔑 Testando login com cador...")
    
    try:
        response = requests.post(url, json=user_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login cador SUCESSO!")
            print(f"Token: {data.get('access_token', 'N/A')[:20]}...")
            print(f"Usuario: {data.get('user', {}).get('username', 'N/A')}")
            print(f"Role: {data.get('user', {}).get('role', 'N/A')}")
        else:
            print("❌ Login cador FALHOU!")
            print(f"Erro: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    print("🧪 TESTANDO SISTEMA DE LOGIN")
    print("="*50)
    test_login()
    print("="*50)
    print("✅ Teste concluído!")