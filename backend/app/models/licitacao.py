from sqlalchemy import Column, Integer, String, Date, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id_licitacao = Column(Integer, primary_key=True, index=True)
    numero_processo = Column(String(50), nullable=False, unique=True)
    modalidade = Column(String(30), nullable=False)
    objeto = Column(String, nullable=False)
    orgao_responsavel = Column(String(100), nullable=False)
    data_abertura = Column(Date, nullable=False)
    data_encerramento = Column(Date, nullable=True)
    status = Column(String(20), nullable=False)
    
    # Campos GCALC - indica se outros quartéis participam
    is_gcalc = Column(Boolean, default=False, nullable=False)
    quartel_ad3 = Column(Boolean, default=False, nullable=False)
    quartel_27gac = Column(Boolean, default=False, nullable=False)
    quartel_easa = Column(Boolean, default=False, nullable=False)

    # Relacionamento com contratos
    contratos = relationship("Contrato", back_populates="licitacao")

    __table_args__ = (UniqueConstraint("numero_processo", name="uq_numero_processo"),)
