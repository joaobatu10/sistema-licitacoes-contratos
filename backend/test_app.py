from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Usuario

# Criar uma aplicação simples para teste
app = FastAPI(title="Teste API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API funcionando!"}

@app.get("/test-users")
def test_users():
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        users = db.query(Usuario).all()
        db.close()
        
        return {
            "status": "success",
            "count": len(users),
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": getattr(user, 'role', 'user'),
                    "is_approved": getattr(user, 'is_approved', True),
                    "is_active": getattr(user, 'is_active', True)
                }
                for user in users
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)