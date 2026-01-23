import sys
import os

# Adiciona o diretório atual ao sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    import uvicorn
    
    print("✅ App importado com sucesso!")
    print("🚀 Iniciando servidor...")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()