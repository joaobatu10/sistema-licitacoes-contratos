from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.notificacao import Notificacao
from app.models.user import Usuario
from app.schemas.notificacao import NotificacaoCreate, NotificacaoUpdate, NotificacaoOut
from app.core.auth import require_admin, require_read_access

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])

@router.get("/", response_model=List[NotificacaoOut])
def listar_notificacoes(
    usuario_id: Optional[int] = None,
    apenas_nao_lidas: bool = False,
    db: Session = Depends(get_db)
):
    """Lista notificações - TEMPORARIAMENTE sem autenticação para debug. Se usuario_id for fornecido, filtra por usuário específico + globais"""
    query = db.query(Notificacao)
    
    if usuario_id:
        # Notificações específicas do usuário + notificações globais
        query = query.filter(
            (Notificacao.usuario_id == usuario_id) | 
            (Notificacao.usuario_id.is_(None))
        )
    
    if apenas_nao_lidas:
        query = query.filter(Notificacao.lida == False)
    
    return query.order_by(Notificacao.data_criacao.desc()).all()

@router.get("/{notificacao_id}", response_model=NotificacaoOut)
def obter_notificacao(notificacao_id: int, db: Session = Depends(get_db)):
    """Obtém uma notificação específica"""
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id).first()
    if not notificacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    return notificacao

@router.post("/", response_model=NotificacaoOut, status_code=status.HTTP_201_CREATED)
def criar_notificacao(
    notificacao: NotificacaoCreate, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Cria uma nova notificação - APENAS ADMINISTRADORES"""
    nova_notificacao = Notificacao(**notificacao.dict())
    db.add(nova_notificacao)
    db.commit()
    db.refresh(nova_notificacao)
    return nova_notificacao

@router.put("/{notificacao_id}", response_model=NotificacaoOut)
def atualizar_notificacao(
    notificacao_id: int,
    notificacao_update: NotificacaoUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Atualiza uma notificação - APENAS ADMINISTRADORES"""
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id).first()
    if not notificacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    # Atualizar apenas os campos fornecidos
    update_data = notificacao_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notificacao, field, value)
    
    # Se marcando como lida, adicionar data de leitura
    if update_data.get('lida') == True and not notificacao.data_leitura:
        notificacao.data_leitura = datetime.utcnow()
    
    db.commit()
    db.refresh(notificacao)
    return notificacao

@router.patch("/{notificacao_id}/marcar-lida")
def marcar_como_lida(notificacao_id: int, db: Session = Depends(get_db)):
    """Marca uma notificação como lida"""
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id).first()
    if not notificacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    notificacao.lida = True
    notificacao.data_leitura = datetime.utcnow()
    db.commit()
    
    return {"message": "Notificação marcada como lida"}

@router.patch("/marcar-todas-lidas")
def marcar_todas_como_lidas(usuario_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Marca todas as notificações como lidas"""
    query = db.query(Notificacao).filter(Notificacao.lida == False)
    
    if usuario_id:
        query = query.filter(
            (Notificacao.usuario_id == usuario_id) | 
            (Notificacao.usuario_id.is_(None))
        )
    
    notificacoes = query.all()
    for notificacao in notificacoes:
        notificacao.lida = True
        notificacao.data_leitura = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"{len(notificacoes)} notificações marcadas como lidas"}

@router.delete("/{notificacao_id}")
def deletar_notificacao(
    notificacao_id: int, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Deleta uma notificação - APENAS ADMINISTRADORES"""
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id).first()
    if not notificacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    db.delete(notificacao)
    db.commit()
    
    return {"message": "Notificação deletada com sucesso"}