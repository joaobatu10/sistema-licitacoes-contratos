from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# Configurações
SECRET_KEY = "seu_secret_key_super_seguro_aqui_123456789"  # Em produção, use uma chave mais segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Context para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash da senha"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria um token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verifica se o token JWT é válido"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependências para verificação de permissões
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Usuario

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtém o usuário atual baseado no token JWT"""
    print(f"🔍 DEBUG get_current_user:")
    
    try:
        token = credentials.credentials
        print(f"   - Token recebido: {token[:50] if token else 'None'}...")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        print(f"   - User ID do token: {user_id}")
        
        if user_id is None:
            print(f"❌ Token sem user_id")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        # Verificar se o token está no formato antigo (username em vez de user_id)
        try:
            int(user_id)  # Tenta converter para int
            print(f"✅ Token no formato correto (user_id numerico)")
        except ValueError:
            # Se não conseguir converter, é um token antigo com username
            print(f"❌ Token formato antigo com username: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token formato antigo. Faça login novamente."
            )
            
    except JWTError as e:
        print(f"❌ Erro JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    print(f"   - Usuário encontrado: {user.username if user else 'None'}")
    
    if user is None:
        print(f"❌ Usuário não encontrado no banco")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    
    if not user.is_active:
        print(f"❌ Usuário inativo")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    if not user.is_approved:
        print(f"❌ Usuário não aprovado")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário aguardando aprovação do administrador"
        )
    
    print(f"✅ Usuário autenticado: {user.username} (role: {user.role})")
    return user

def require_admin(current_user: Usuario = Depends(get_current_user)):
    """Verifica se o usuário atual é administrador"""
    print(f"🔒 DEBUG require_admin:")
    print(f"   - Current user: {current_user.username if current_user else 'None'}")
    print(f"   - User role: {current_user.role if current_user else 'None'}")
    print(f"   - Is admin: {current_user.role == 'admin' if current_user else False}")
    
    if current_user.role != "admin":
        print(f"❌ Acesso negado! Role '{current_user.role}' != 'admin'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem realizar esta ação."
        )
    
    print(f"✅ Acesso liberado para admin: {current_user.username}")
    return current_user

def require_read_access(current_user: Usuario = Depends(get_current_user)):
    """Permite acesso de leitura para usuários aprovados"""
    return current_user