from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base import Base

class Contrato(Base):
    __tablename__ = "contratos"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_contrato = Column(String(50), unique=True, nullable=False, index=True)
    licitacao_id = Column(Integer, ForeignKey("licitacoes.id_licitacao"), nullable=False)
    fornecedor = Column(String(200), nullable=False)
    objeto = Column(Text, nullable=False)
    valor_total = Column(DECIMAL(15, 2), nullable=False)
    valor_parcela_mensal = Column(DECIMAL(15, 2), nullable=True)
    data_assinatura = Column(Date, nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=True)
    status = Column(String(30), nullable=False, default="Ativo")
    
    # Relacionamento com licitação
    licitacao = relationship("Licitacao", back_populates="contratos")