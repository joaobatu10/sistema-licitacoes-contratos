from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.licitacao import Licitacao
from app.schemas.licitacao import LicitacaoCreate, LicitacaoUpdate

router = APIRouter(prefix="/licitacoes", tags=["Licitações"])

def normalizar_quartel(valor: str) -> str:
    texto = (valor or "").lower().strip()

    if "29" in texto and "gac" in texto:
        return "29º GAC AP"
    if "27" in texto and "gac" in texto:
        return "27 GAC"
    if "ad/3" in texto or "ad3" in texto:
        return "AD/3"
    if "easa" in texto:
        return "EASA"

    return valor or ""

def sanitizar_gcalc(dados: dict) -> dict:
    dados = dict(dados)

    if not dados.get("is_gcalc", False):
        dados["quartel_ad3"] = False
        dados["quartel_27gac"] = False
        dados["quartel_29gacap"] = False
        dados["quartel_easa"] = False
        return dados

    orgao = normalizar_quartel(dados.get("orgao_responsavel", ""))

    if orgao == "AD/3":
        dados["quartel_ad3"] = False
    elif orgao == "27 GAC":
        dados["quartel_27gac"] = False
    elif orgao == "29º GAC AP":
        dados["quartel_29gacap"] = False
    elif orgao == "EASA":
        dados["quartel_easa"] = False

    return dados

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return db.query(Licitacao).all()

@router.get("/{id_licitacao}")
def obter(id_licitacao: int, db: Session = Depends(get_db)):
    licitacao = db.query(Licitacao).filter(Licitacao.id_licitacao == id_licitacao).first()
    if not licitacao:
        raise HTTPException(status_code=404, detail="Licitação não encontrada")
    return licitacao

@router.post("/")
def criar(payload: LicitacaoCreate, db: Session = Depends(get_db)):
    dados = sanitizar_gcalc(payload.model_dump())

    nova = Licitacao(**dados)
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.put("/{id_licitacao}")
def atualizar(id_licitacao: int, payload: LicitacaoUpdate, db: Session = Depends(get_db)):
    licitacao = db.query(Licitacao).filter(Licitacao.id_licitacao == id_licitacao).first()
    if not licitacao:
        raise HTTPException(status_code=404, detail="Licitação não encontrada")

    dados = sanitizar_gcalc(payload.model_dump())

    for campo, valor in dados.items():
        setattr(licitacao, campo, valor)

    db.commit()
    db.refresh(licitacao)
    return licitacao

@router.delete("/{id_licitacao}")
def excluir(id_licitacao: int, db: Session = Depends(get_db)):
    licitacao = db.query(Licitacao).filter(Licitacao.id_licitacao == id_licitacao).first()
    if not licitacao:
        raise HTTPException(status_code=404, detail="Licitação não encontrada")

    db.delete(licitacao)
    db.commit()
    return {"message": "Licitação deletada com sucesso"}