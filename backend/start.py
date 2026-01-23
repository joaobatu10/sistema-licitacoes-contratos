#!/usr/bin/env python3
"""
Script para iniciar o servidor FastAPI
"""
import os
import sys
import uvicorn

def start_server():
    """Inicia o servidor FastAPI"""
    try:
        print("🚀 Iniciando servidor FastAPI...")
        print("📍 Host: 127.0.0.1")
        print("🔌 Porta: 8000") 
        print("⚠️  Para parar o servidor, use Ctrl+C\n")
        
        # Inicia o servidor usando string import para suporte ao reload
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    start_server()