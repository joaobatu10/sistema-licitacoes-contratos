import sqlite3

def verificar_banco():
    conn = sqlite3.connect('licitacoes.db')
    cursor = conn.cursor()
    
    # Verificar estrutura da tabela usuarios
    cursor.execute("PRAGMA table_info(usuarios)")
    columns = cursor.fetchall()
    
    print("📋 Estrutura da tabela usuarios:")
    for col in columns:
        print(f"  {col[1]} - {col[2]} {'(NOT NULL)' if col[3] else '(NULL)'} {'DEFAULT: ' + str(col[4]) if col[4] else ''}")
    
    # Verificar dados dos usuários
    cursor.execute("SELECT * FROM usuarios")
    users = cursor.fetchall()
    
    print(f"\n👥 Usuários na base de dados ({len(users)}):")
    for user in users:
        print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}")
        if len(user) > 3:
            print(f"    Role: {user[4] if len(user) > 4 else 'N/A'}")
            print(f"    Approved: {user[5] if len(user) > 5 else 'N/A'}")
            print(f"    Active: {user[6] if len(user) > 6 else 'N/A'}")
        print()
    
    conn.close()

if __name__ == "__main__":
    verificar_banco()