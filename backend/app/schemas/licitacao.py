from pydantic import BaseModel
from datetime import date
from typing import Optional

class LicitacaoBase(BaseModel):
    numero_processo: str
    modalidade: str
    objeto: str
    orgao_responsavel: str
    data_abertura: date
    data_encerramento: Optional[date] = None
    status: Optional[str] = None

    is_gcalc: bool = False
    quartel_ad3: bool = False
    quartel_27gac: bool = False
    quartel_29gacap: bool = False
    quartel_easa: bool = False

class LicitacaoCreate(LicitacaoBase):
    pass

class LicitacaoUpdate(LicitacaoBase):
    pass

class LicitacaoOut(LicitacaoBase):
    id_licitacao: int

    class Config:
        from_attributes = True