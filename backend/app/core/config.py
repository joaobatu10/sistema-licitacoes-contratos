import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Usar caminho absoluto para o banco para evitar problemas de diretório
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'licitacoes.db')}")
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176").split(",")

settings = Settings()
