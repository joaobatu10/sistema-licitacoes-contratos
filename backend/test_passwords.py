import sqlite3
import bcrypt

def test_password():
    """Testa as senhas dos usuários para descobrir as corretas"""
    
    conn = sqlite3.connect("licitacoes.db")
    cursor = conn.cursor()
    
    # Buscar usuários
    cursor.execute("SELECT id, username, password FROM usuarios")
    users = cursor.fetchall()
    
    # Senhas comuns para testar
    common_passwords = [
        "admin123", "123456", "password", "admin", "123", 
        "password123", "admin@123", "teste", "test", "cador",
        "newpass2024", "newuser2024", "testuser", "user123"
    ]
    
    print("🔍 Testando senhas dos usuários...")
    print("="*50)
    
    for user_id, username, hashed_password in users:
        print(f"\n👤 Usuário: {username}")
        
        for password in common_passwords:
            try:
                if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
                    print(f"✅ SENHA ENCONTRADA: '{password}'")
                    break
            except:
                continue
        else:
            print("❌ Nenhuma senha comum funcionou")
    
    conn.close()

if __name__ == "__main__":
    test_password()