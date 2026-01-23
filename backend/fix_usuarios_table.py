import sqlite3
import os
from datetime import datetime

def fix_usuarios_table():
    """Adiciona a coluna 'role' na tabela usuarios se ela não existir"""
    
    db_path = "licitacoes.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Banco de dados {db_path} não encontrado!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar estrutura atual da tabela
        cursor.execute("PRAGMA table_info(usuarios)")
        columns = cursor.fetchall()
        print("📋 Estrutura atual da tabela usuarios:")
        for col in columns:
            print(f"   - {col[1]} ({col[2]})")
        
        # Verificar se a coluna 'role' já existe
        column_names = [col[1] for col in columns]
        if 'role' in column_names:
            print("✅ Coluna 'role' já existe!")
        else:
            print("🔧 Adicionando coluna 'role'...")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT 'user'")
            print("✅ Coluna 'role' adicionada com sucesso!")
        
        # Verificar e adicionar outras colunas necessárias
        required_columns = {
            'is_approved': "INTEGER DEFAULT 1",
            'is_active': "INTEGER DEFAULT 1", 
            'created_at': "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'approved_at': "TIMESTAMP",
            'approved_by': "INTEGER"
        }
        
        for col_name, col_definition in required_columns.items():
            if col_name not in column_names:
                print(f"🔧 Adicionando coluna '{col_name}'...")
                cursor.execute(f"ALTER TABLE usuarios ADD COLUMN {col_name} {col_definition}")
                print(f"✅ Coluna '{col_name}' adicionada!")
        
        # Verificar se há usuários na tabela
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        user_count = cursor.fetchone()[0]
        print(f"👥 Total de usuários: {user_count}")
        
        if user_count > 0:
            # Verificar usuários existentes
            cursor.execute("SELECT id, username, role FROM usuarios")
            users = cursor.fetchall()
            
            print("\n👤 Usuários encontrados:")
            for user in users:
                role = user[2] if user[2] else 'user'
                print(f"   - ID: {user[0]}, Username: {user[1]}, Role: {role}")
            
            # Se não há nenhum admin, tornar o primeiro usuário admin
            cursor.execute("SELECT COUNT(*) FROM usuarios WHERE role = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count == 0:
                print("🔧 Nenhum admin encontrado. Definindo primeiro usuário como admin...")
                cursor.execute("UPDATE usuarios SET role = 'admin' WHERE id = (SELECT MIN(id) FROM usuarios)")
                print("✅ Primeiro usuário definido como admin!")
            
            # Se role é NULL, definir como 'user'
            cursor.execute("UPDATE usuarios SET role = 'user' WHERE role IS NULL")
            
        else:
            print("⚠️ Nenhum usuário encontrado na tabela!")
        
        conn.commit()
        
        # Mostrar estrutura final
        cursor.execute("PRAGMA table_info(usuarios)")
        columns = cursor.fetchall()
        print("\n📋 Estrutura final da tabela usuarios:")
        for col in columns:
            print(f"   - {col[1]} ({col[2]})")
        
        # Mostrar usuários finais
        cursor.execute("SELECT id, username, role, is_approved, is_active FROM usuarios")
        users = cursor.fetchall()
        if users:
            print("\n👤 Usuários finais:")
            for user in users:
                print(f"   - ID: {user[0]}, Username: {user[1]}, Role: {user[2]}, Approved: {user[3]}, Active: {user[4]}")
        
        conn.close()
        print("\n🎉 Correção da tabela usuarios concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao corrigir tabela: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Iniciando correção da tabela usuarios...")
    success = fix_usuarios_table()
    
    if success:
        print("\n✅ CORREÇÃO CONCLUÍDA!")
        print("Agora você pode:")
        print("1. Reiniciar o servidor")
        print("2. Fazer login normalmente")
        print("3. Testar a funcionalidade de delete")
    else:
        print("\n❌ CORREÇÃO FALHOU!")
        print("Verifique os erros acima.")