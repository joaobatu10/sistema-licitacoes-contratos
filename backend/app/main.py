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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserLoginOut(BaseModel):
    id: int
    username: str
    email: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserLoginOut

@app.on_event("startup")
def on_startup():
    base.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "API rodando"}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/login", response_model=LoginResponse)
def login_global(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(Usuario).filter(Usuario.username == username).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=30),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    }

app.include_router(users_router)
app.include_router(licitacoes_router)
app.include_router(contratos_router)
app.include_router(notificacoes_router)