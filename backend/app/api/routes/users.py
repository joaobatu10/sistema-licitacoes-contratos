from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Usuario
from app.schemas.user import UserCreate, UserLogin, Token, UserOut, UsersPendingApproval, UserApproval
from app.core.auth import get_password_hash, verify_password, create_access_token, require_admin, require_read_access, get_current_user
from datetime import timedelta, datetime
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.get("")
def listar_usuarios(db: Session = Depends(get_db)):
    """Lista todos os usuários - temporariamente sem autenticação para debug"""
    usuarios = db.query(Usuario).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'user'),
            "is_approved": getattr(user, 'is_approved', True),
            "is_active": getattr(user, 'is_active', True)
        }
        for user in usuarios
    ]

@router.get("/me")
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    """Retorna informações do usuário autenticado atual"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": getattr(current_user, 'role', 'user'),
        "is_approved": getattr(current_user, 'is_approved', True),
        "is_active": getattr(current_user, 'is_active', True)
    }

@router.get("/{user_id}")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Busca usuário por ID - APENAS ADMINISTRADORES"""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": getattr(user, 'role', 'user'),
        "is_approved": getattr(user, 'is_approved', True),
        "is_active": getattr(user, 'is_active', True),
        "created_at": getattr(user, 'created_at', None)
    }

# Rotas temporárias sem autenticação para debug
@router.get("/debug/licitacoes")
def debug_licitacoes(db: Session = Depends(get_db)):
    """Debug: Licitações sem autenticação"""
    from app.models.licitacao import Licitacao
    return db.query(Licitacao).all()

@router.get("/debug/contratos")
def debug_contratos(db: Session = Depends(get_db)):
    """Debug: Contratos sem autenticação"""
    from app.models.contrato import Contrato
    return db.query(Contrato).all()

@router.get("/debug/notificacoes")
def debug_notificacoes(db: Session = Depends(get_db)):
    """Debug: Notificações sem autenticação"""
    from app.models.notificacao import Notificacao
    return db.query(Notificacao).all()

@router.get("/pending", response_model=List[UsersPendingApproval])
def listar_usuarios_pendentes(
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Lista usuários aguardando aprovação - APENAS ADMINISTRADORES"""
    usuarios_pendentes = db.query(Usuario).filter(
        Usuario.is_approved == False,
        Usuario.is_active == True
    ).all()
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": getattr(user, 'created_at', None)
        }
        for user in usuarios_pendentes
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def criar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    """Cria novo usuário aguardando aprovação do administrador"""
    if db.query(Usuario).filter(Usuario.username == user.username).first():
        raise HTTPException(409, "Username já existe")
    if db.query(Usuario).filter(Usuario.email == user.email).first():
        raise HTTPException(409, "Email já existe")
    
    # Hash da senha
    hashed_password = get_password_hash(user.password)
    
    # Criar usuário com aprovação pendente
    novo = Usuario(
        username=user.username, 
        email=user.email, 
        password=hashed_password,
        role="user",  # Usuário comum por padrão
        is_approved=False,  # Aguardando aprovação
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(novo)
    db.commit()
    db.refresh(novo)
    
    return {
        "id": novo.id, 
        "username": novo.username, 
        "email": novo.email,
        "message": "Usuário criado. Aguardando aprovação do administrador."
    }

@router.post("/approve/{user_id}")
def aprovar_usuario(
    user_id: int,
    approval_data: UserApproval,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Aprova ou rejeita um usuário - apenas administradores"""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    
    if user.is_approved:
        raise HTTPException(400, "Usuário já foi aprovado")
    
    user.is_approved = approval_data.approved
    user.approved_by = admin_user.id
    user.approved_at = datetime.utcnow()
    
    if not approval_data.approved:
        user.is_active = False  # Desativar se rejeitado
    
    db.commit()
    
    status_msg = "aprovado" if approval_data.approved else "rejeitado"
    return {"message": f"Usuário {user.username} foi {status_msg}"}

@router.post("/make-admin/{user_id}")
def tornar_administrador(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Torna um usuário administrador - apenas administradores"""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    
    if not user.is_approved:
        raise HTTPException(400, "Usuário deve estar aprovado para se tornar administrador")
    
    user.role = "admin"
    db.commit()
    
    return {"message": f"Usuário {user.username} agora é administrador"}

@router.post("/change-role/{user_id}")
def alterar_role_usuario(
    user_id: int,
    role: str = Form(),
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Altera o role de um usuário (admin ou user) - apenas administradores"""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    
    if user.id == admin_user.id:
        raise HTTPException(400, "Você não pode alterar seu próprio role")
    
    if role not in ["admin", "user"]:
        raise HTTPException(400, "Role deve ser 'admin' ou 'user'")
    
    if not user.is_approved:
        raise HTTPException(400, "Usuário deve estar aprovado para alterar role")
    
    old_role = getattr(user, 'role', 'user')
    user.role = role
    db.commit()
    
    role_name = "administrador" if role == "admin" else "usuário comum"
    return {"message": f"Usuário {user.username} agora é {role_name}", "old_role": old_role, "new_role": role}

@router.delete("/{user_id}")
def deletar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Deleta um usuário - APENAS ADMINISTRADORES"""
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Impedir que admin delete a si mesmo
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Você não pode deletar sua própria conta")
    
    # Impedir deletar o último administrador
    admin_count = db.query(Usuario).filter(Usuario.role == "admin").count()
    if user.role == "admin" and admin_count <= 1:
        raise HTTPException(status_code=400, detail="Não é possível deletar o último administrador do sistema")
    
    username = user.username
    db.delete(user)
    db.commit()
    
    return {"message": f"Usuário {username} foi deletado com sucesso"}

class ResetPasswordDebug(BaseModel):
    username: str
    new_password: str

@router.post("/debug/reset-password")
def reset_password_debug(data: ResetPasswordDebug, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == data.username).first()

    if not user:
        raise HTTPException(404, "Usuário não encontrado")

    user.password = get_password_hash(data.new_password)

    if hasattr(user, "is_active"):
        user.is_active = True

    if hasattr(user, "is_approved"):
        user.is_approved = True

    db.commit()

    return {"message": f"Senha do usuário {user.username} atualizada com sucesso"}
@router.post("/login")
def login(username: str = Form(), password: str = Form(), db: Session = Depends(get_db)):
    """Rota de login - autentica usuário e retorna token JWT"""
    # Buscar usuário no banco
    user = db.query(Usuario).filter(Usuario.username == username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se usuário está ativo (com fallback para usuários antigos)
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Conta desativada. Entre em contato com o administrador.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se usuário foi aprovado (com fallback para usuários antigos)
    is_approved = getattr(user, 'is_approved', True)
    if not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta aguardando aprovação do administrador.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar senha
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token com user.id ao invés de username
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, 'role', 'user'),
            "is_approved": getattr(user, 'is_approved', True)
        }
    }
