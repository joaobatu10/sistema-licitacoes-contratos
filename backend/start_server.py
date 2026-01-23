#!/usr/bin/env python
import sys
import os
import subprocess

# Adicionar o diretório backend ao sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Definir variável de ambiente PYTHONPATH
os.environ["PYTHONPATH"] = current_dir

# Executar uvicorn
if __name__ == "__main__":
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "app.main:app", 
        "--reload", 
        "--host", "127.0.0.1", 
        "--port", "8000"
    ])