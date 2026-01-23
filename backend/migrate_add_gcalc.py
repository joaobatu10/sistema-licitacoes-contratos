import sqlite3
import os

# Conecta ao banco
db_path = os.path.join(os.path.dirname(__file__), "licitacoes.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Verifica se as colunas já existem
    cursor.execute("PRAGMA table_info(licitacoes)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # Adiciona as colunas GCALC se não existirem
    if 'is_gcalc' not in columns:
        cursor.execute("ALTER TABLE licitacoes ADD COLUMN is_gcalc BOOLEAN DEFAULT 0")
        print("✓ Coluna is_gcalc adicionada")
    else:
        print("✓ Coluna is_gcalc já existe")
    
    if 'quartel_ad3' not in columns:
        cursor.execute("ALTER TABLE licitacoes ADD COLUMN quartel_ad3 BOOLEAN DEFAULT 0")
        print("✓ Coluna quartel_ad3 adicionada")
    else:
        print("✓ Coluna quartel_ad3 já existe")
        
    if 'quartel_27gac' not in columns:
        cursor.execute("ALTER TABLE licitacoes ADD COLUMN quartel_27gac BOOLEAN DEFAULT 0")
        print("✓ Coluna quartel_27gac adicionada")
    else:
        print("✓ Coluna quartel_27gac já existe")
        
    if 'quartel_easa' not in columns:
        cursor.execute("ALTER TABLE licitacoes ADD COLUMN quartel_easa BOOLEAN DEFAULT 0")
        print("✓ Coluna quartel_easa adicionada")
    else:
        print("✓ Coluna quartel_easa já existe")
    
    # Confirma as alterações
    conn.commit()
    print("✓ Migração concluída com sucesso!")
    
except Exception as e:
    print(f"Erro na migração: {e}")
    conn.rollback()
    
finally:
    conn.close()