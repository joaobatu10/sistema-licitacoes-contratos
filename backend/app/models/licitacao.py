from sqlalchemy import Column, Integer, String, Date, Boolean
from app.db.base import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id_licitacao = Column(Integer, primary_key=True, index=True)
    numero_processo = Column(String, nullable=False)
    modalidade = Column(String, nullable=False)
    objeto = Column(String, nullable=False)
    orgao_responsavel = Column(String, nullable=False)
    data_abertura = Column(Date, nullable=False)
    data_encerramento = Column(Date, nullable=True)
    status = Column(String, nullable=True)

    # GCALC
    is_gcalc = Column(Boolean, default=False)
    quartel_ad3 = Column(Boolean, default=False)
    quartel_27gac = Column(Boolean, default=False)
    quartel_29gacap = Column(Boolean, default=False)
    quartel_easa = Column(Boolean, default=False)