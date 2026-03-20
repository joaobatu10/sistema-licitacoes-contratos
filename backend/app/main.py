from fastapi import FastAPI, Form, HTTPException, status, Depends, Request, Response
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def force_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            },
        )

    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response
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
    return {"message": "API rodando", "cors_test": "v2"}

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

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
        )

    try:
        senha_ok = verify_password(password, user.password)
    except Exception as e:
        print("ERRO AO VALIDAR SENHA NO LOGIN:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
        )

    if not senha_ok:
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