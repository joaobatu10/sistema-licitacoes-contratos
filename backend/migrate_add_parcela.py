import sqlite3
import sys
import os

def add_valor_parcela_mensal_column():
    """Adiciona a coluna valor_parcela_mensal à tabela contratos"""
    
    db_path = 'licitacoes.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Erro: Banco de dados não encontrado: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(contratos)")
        columns = cursor.fetchall()
        
        existing_columns = [col[1] for col in columns]
        
        if 'valor_parcela_mensal' in existing_columns:
            print("✅ Coluna 'valor_parcela_mensal' já existe na tabela contratos")
            conn.close()
            return True
        
        # Adicionar a coluna
        print("🔄 Adicionando coluna 'valor_parcela_mensal' à tabela contratos...")
        cursor.execute("ALTER TABLE contratos ADD COLUMN valor_parcela_mensal DECIMAL(15, 2)")
        
        conn.commit()
        
        # Verificar se foi adicionada com sucesso
        cursor.execute("PRAGMA table_info(contratos)")
        columns = cursor.fetchall()
        
        print("📋 Estrutura atualizada da tabela contratos:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        print("✅ Coluna adicionada com sucesso!")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Atualizando estrutura do banco de dados...")
    success = add_valor_parcela_mensal_column()
    
    if success:
        print("🎉 Migração concluída com sucesso!")
    else:
        print("💥 Migração falhou!")
        sys.exit(1)