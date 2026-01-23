from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal

class ContratoBase(BaseModel):
    numero_contrato: str
    licitacao_id: int
    fornecedor: str
    objeto: str
    valor_total: Decimal
    valor_parcela_mensal: Optional[Decimal] = None
    data_assinatura: date
    data_inicio: date
    data_fim: Optional[date] = None
    status: str = "Ativo"

class ContratoCreate(ContratoBase):
    pass

class ContratoUpdate(BaseModel):
    numero_contrato: Optional[str] = None
    fornecedor: Optional[str] = None
    objeto: Optional[str] = None
    valor_total: Optional[Decimal] = None
    valor_parcela_mensal: Optional[Decimal] = None
    data_assinatura: Optional[date] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[str] = None

class ContratoOut(ContratoBase):
    id: int

    class Config:
        from_attributes = True