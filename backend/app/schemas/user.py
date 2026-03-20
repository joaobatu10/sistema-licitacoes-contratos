from pydantic import BaseModel
from datetime import datetime
from typing import Optional



class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str] = "user"
    is_approved: Optional[bool] = False
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict  # Temporariamente mudando para dict para evitar problemas de serialização

class UserApproval(BaseModel):
    user_id: int
    approved: bool

class UsersPendingApproval(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
