import sqlite3

def mostrar_estrutura_tabelas():
    conn = sqlite3.connect('licitacoes.db')
    cursor = conn.cursor()

    print('📊 ESTRUTURA DAS TABELAS NO BANCO DE DADOS')
    print('=' * 50)

    # Listar todas as tabelas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    print('🗂️ Tabelas existentes:')
    for table in tables:
        print(f'  - {table[0]}')

    print('\n📋 DETALHES DAS TABELAS:')
    print('=' * 50)

    for table in tables:
        table_name = table[0]
        print(f'\n🔹 Tabela: {table_name}')
        print('-' * 30)
        
        # Estrutura da tabela
        cursor.execute(f'PRAGMA table_info({table_name})')
        columns = cursor.fetchall()
        
        print(f"{'Campo':20} | {'Tipo':15} | {'NULL':8} | {'PK':2}")
        print(f"{'-'*20} | {'-'*15} | {'-'*8} | {'-'*2}")
        
        for col in columns:
            nullable = 'NOT NULL' if col[3] else 'NULL'
            pk = 'PK' if col[5] else ''
            print(f'{col[1]:20} | {col[2]:15} | {nullable:8} | {pk:2}')
        
        # Contar registros
        cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
        count = cursor.fetchone()[0]
        print(f'📊 Total de registros: {count}')

    conn.close()

if __name__ == "__main__":
    mostrar_estrutura_tabelas()