import sqlite3

def verificar_dados():
    conn = sqlite3.connect('licitacoes.db')
    cursor = conn.cursor()
    
    # Verificar todas as tabelas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tabelas = cursor.fetchall()
    
    print("📊 Tabelas no banco de dados:")
    for tabela in tabelas:
        print(f"  - {tabela[0]}")
    
    # Verificar dados em cada tabela
    tabelas_dados = ['usuarios', 'licitacoes', 'contratos', 'notificacoes']
    
    for tabela in tabelas_dados:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"\n📋 Tabela '{tabela}': {count} registros")
            
            if count > 0:
                cursor.execute(f"SELECT * FROM {tabela} LIMIT 3")
                registros = cursor.fetchall()
                
                # Mostrar estrutura da tabela
                cursor.execute(f"PRAGMA table_info({tabela})")
                colunas = [col[1] for col in cursor.fetchall()]
                
                print(f"  Colunas: {', '.join(colunas)}")
                print("  Primeiros registros:")
                for i, registro in enumerate(registros, 1):
                    print(f"    {i}: {registro}")
                    
        except Exception as e:
            print(f"❌ Erro ao verificar tabela {tabela}: {e}")
    
    conn.close()

if __name__ == "__main__":
    verificar_dados()