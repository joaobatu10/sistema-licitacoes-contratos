from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.contrato import Contrato
from app.models.user import Usuario
from app.schemas.contrato import ContratoCreate, ContratoOut, ContratoUpdate
from app.core.auth import require_admin, require_read_access

router = APIRouter(prefix="/contratos", tags=["contratos"])

@router.post("/", response_model=ContratoOut)
def criar_contrato(
    contrato: ContratoCreate, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Criar um novo contrato - APENAS ADMINISTRADORES"""
    # Verificar se já existe um contrato com o mesmo número
    existing_contrato = db.query(Contrato).filter(Contrato.numero_contrato == contrato.numero_contrato).first()
    if existing_contrato:
        raise HTTPException(status_code=400, detail="Já existe um contrato com este número")
    
    db_contrato = Contrato(**contrato.dict())
    db.add(db_contrato)
    db.commit()
    db.refresh(db_contrato)
    return db_contrato

@router.get("/", response_model=List[ContratoOut])
def listar_contratos(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Listar todos os contratos - TEMPORARIAMENTE sem autenticação para debug"""
    contratos = db.query(Contrato).offset(skip).limit(limit).all()
    return contratos

@router.get("/{contrato_id}", response_model=ContratoOut)
def obter_contrato(
    contrato_id: int, 
    db: Session = Depends(get_db)
):
    """Obter um contrato específico - TEMPORARIAMENTE sem autenticação para debug"""
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato

@router.put("/{contrato_id}", response_model=ContratoOut)
def atualizar_contrato(
    contrato_id: int, 
    contrato: ContratoUpdate, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Atualizar um contrato - APENAS ADMINISTRADORES"""
    db_contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    update_data = contrato.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contrato, field, value)
    
    db.commit()
    db.refresh(db_contrato)
    return db_contrato

@router.delete("/{contrato_id}")
def deletar_contrato(
    contrato_id: int, 
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """Deletar um contrato - APENAS ADMINISTRADORES"""
    db_contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    db.delete(db_contrato)
    db.commit()
    return {"message": "Contrato deletado com sucesso"}

@router.get("/licitacao/{licitacao_id}", response_model=List[ContratoOut])
def listar_contratos_por_licitacao(
    licitacao_id: int, 
    db: Session = Depends(get_db)
):
    """Listar contratos de uma licitação específica - TEMPORARIAMENTE sem autenticação para debug"""
    contratos = db.query(Contrato).filter(Contrato.licitacao_id == licitacao_id).all()
    return contratos