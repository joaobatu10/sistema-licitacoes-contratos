import sys
import os
import asyncio

# Adiciona o diretório atual ao sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    import uvicorn
    
    print("✅ App importado com sucesso!")
    
    if __name__ == "__main__":
        print("🚀 Iniciando servidor na porta 8000 com RELOAD...")
        print("⚠️  Para parar o servidor, use Ctrl+C")
        
        # Usar reload=True para aplicar mudanças automaticamente
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()