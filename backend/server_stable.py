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
        print("🚀 Iniciando servidor na porta 8000...")
        print("⚠️  Para parar o servidor, use Ctrl+C")
        
        config = uvicorn.Config(
            app=app,
            host="127.0.0.1",
            port=8000,
            log_level="info",
            reload=False
        )
        server = uvicorn.Server(config)
        
        try:
            server.run()
        except KeyboardInterrupt:
            print("🛑 Servidor parado pelo usuário")
        except Exception as e:
            print(f"❌ Erro no servidor: {e}")
            import traceback
            traceback.print_exc()
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()