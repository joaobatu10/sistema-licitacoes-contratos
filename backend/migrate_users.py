"""
Script para migrar usuários existentes com as novas colunas de role e aprovação
Execute este script apenas uma vez após atualizar o modelo Usuario
"""

import sqlite3
from datetime import datetime

def migrate_existing_users():
    # Conectar ao banco SQLite
    conn = sqlite3.connect('licitacoes.db')
    cursor = conn.cursor()
    
    try:
        # Verificar se as novas colunas já existem
        cursor.execute("PRAGMA table_info(usuarios)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Adicionar novas colunas se não existirem
        if 'role' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT "user"')
            print("Coluna 'role' adicionada")
        
        if 'is_approved' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN is_approved BOOLEAN DEFAULT 0')
            print("Coluna 'is_approved' adicionada")
            
        if 'is_active' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN is_active BOOLEAN DEFAULT 1')
            print("Coluna 'is_active' adicionada")
            
        if 'created_at' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN created_at DATETIME')
            print("Coluna 'created_at' adicionada")
            
        if 'approved_at' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN approved_at DATETIME')
            print("Coluna 'approved_at' adicionada")
            
        if 'approved_by' not in columns:
            cursor.execute('ALTER TABLE usuarios ADD COLUMN approved_by INTEGER')
            print("Coluna 'approved_by' adicionada")
        
        # Atualizar usuários existentes
        current_time = datetime.utcnow().isoformat()
        
        # Definir o primeiro usuário como admin aprovado (assumindo que seja o ID 1)
        cursor.execute('''
            UPDATE usuarios 
            SET role = "admin", 
                is_approved = 1, 
                is_active = 1,
                created_at = ?,
                approved_at = ?
            WHERE id = 1
        ''', (current_time, current_time))
        
        # Aprovar todos os outros usuários existentes como usuários comuns
        cursor.execute('''
            UPDATE usuarios 
            SET role = "user", 
                is_approved = 1, 
                is_active = 1,
                created_at = ?,
                approved_at = ?
            WHERE id != 1
        ''', (current_time, current_time))
        
        # Confirmar as mudanças
        conn.commit()
        
        # Verificar quantos usuários foram atualizados
        cursor.execute('SELECT COUNT(*) FROM usuarios')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM usuarios WHERE role = "admin"')
        admin_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM usuarios WHERE is_approved = 1')
        approved_count = cursor.fetchone()[0]
        
        print(f"\n✅ Migração concluída com sucesso!")
        print(f"Total de usuários: {total_users}")
        print(f"Administradores: {admin_count}")
        print(f"Usuários aprovados: {approved_count}")
        
        # Mostrar detalhes dos usuários
        cursor.execute('SELECT id, username, role, is_approved, is_active FROM usuarios')
        users = cursor.fetchall()
        
        print("\n📋 Status dos usuários:")
        for user in users:
            id, username, role, is_approved, is_active = user
            status_approved = "✅ Aprovado" if is_approved else "⏳ Pendente"
            status_active = "🟢 Ativo" if is_active else "🔴 Inativo"
            role_icon = "👑 Admin" if role == "admin" else "👤 Usuário"
            print(f"ID {id}: {username} - {role_icon} - {status_approved} - {status_active}")
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Iniciando migração de usuários...")
    migrate_existing_users()
    print("\n🎉 Migração finalizada!")