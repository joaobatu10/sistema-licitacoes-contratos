from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # "admin" ou "user"
    is_approved = Column(Boolean, default=False, nullable=False)  # Aprovação do admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, nullable=True)  # ID do admin que aprovou
    
    # Relacionamento com notificações
    notificacoes = relationship("Notificacao", back_populates="usuario")
