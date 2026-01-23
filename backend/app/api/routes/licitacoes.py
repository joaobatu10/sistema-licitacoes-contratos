from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.licitacao import Licitacao
from app.schemas.licitacao import LicitacaoCreate
from app.core.auth import require_admin, require_read_access
from app.models.user import Usuario

router = APIRouter(prefix="/licitacoes", tags=["Licitações"])

@router.get("/")
def listar(db: Session = Depends(get_db)):
    """Lista licitações - TEMPORARIAMENTE sem autenticação para debug"""
    return db.query(Licitacao).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar(
    payload: LicitacaoCreate, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Cria nova licitação - APENAS ADMINISTRADORES"""
    print(f"🔍 DEBUG POST /licitacoes/:")
    print(f"   - Payload: {payload}")
    print(f"   - Admin user: {admin_user.username if admin_user else 'None'}")
    print(f"   - Admin role: {admin_user.role if admin_user else 'None'}")
    
    if db.query(Licitacao).filter(Licitacao.numero_processo == payload.numero_processo).first():
        raise HTTPException(409, "Número de processo já cadastrado")
    nova = Licitacao(**payload.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    
    print(f"✅ Licitação criada com ID: {nova.id_licitacao}")
    return nova

@router.get("/{id_licitacao}")
def obter(
    id_licitacao: int, 
    db: Session = Depends(get_db)
):
    """Obtém licitação específica - TEMPORARIAMENTE sem autenticação para debug"""
    lic = db.query(Licitacao).get(id_licitacao)
    if not lic:
        raise HTTPException(404, "Licitação não encontrada")
    return lic

@router.put("/{id_licitacao}")
def atualizar(
    id_licitacao: int,
    payload: LicitacaoCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Atualiza licitação existente - APENAS ADMINISTRADORES"""
    print(f"🔄 DEBUG PUT /licitacoes/{id_licitacao}:")
    print(f"   - Payload: {payload}")
    print(f"   - Admin user: {admin_user.username if admin_user else 'None'}")
    
    # Buscar licitação existente
    licitacao = db.query(Licitacao).filter(Licitacao.id_licitacao == id_licitacao).first()
    if not licitacao:
        raise HTTPException(404, "Licitação não encontrada")
    
    # Verificar se o número do processo já existe em outra licitação
    existing = db.query(Licitacao).filter(
        Licitacao.numero_processo == payload.numero_processo,
        Licitacao.id_licitacao != id_licitacao
    ).first()
    if existing:
        raise HTTPException(409, "Número de processo já cadastrado em outra licitação")
    
    # Atualizar campos
    for field, value in payload.model_dump().items():
        setattr(licitacao, field, value)
    
    db.commit()
    db.refresh(licitacao)
    
    print(f"✅ Licitação {id_licitacao} atualizada com sucesso")
    return licitacao

@router.delete("/{id_licitacao}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    id_licitacao: int, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Exclui licitação - APENAS ADMINISTRADORES"""
    lic = db.query(Licitacao).get(id_licitacao)
    if not lic:
        raise HTTPException(404, "Licitação não encontrada")
    db.delete(lic)
    db.commit()
