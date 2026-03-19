from fastapi import FastAPI, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel

from app.db.session import engine, get_db
from app.db import base
from app.api.routes.users import router as users_router
from app.api.routes.licitacoes import router as licitacoes_router
from app.api.routes.contratos import router as contratos_router
from app.api.routes.notificacoes import router as notificacoes_router
from app.models.user import Usuario
from app.core.auth import verify_password, create_access_token

app = FastAPI(title="Sistema de Monitoramento de Licitações e Contratos")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sistema-licitacoes-contratos-mj9k.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://sistema-licitacoes-contratos-mj9k-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)