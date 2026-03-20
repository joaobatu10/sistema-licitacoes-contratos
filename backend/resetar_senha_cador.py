import sqlite3
from passlib.context import CryptContext

DB_PATH = "licitacoes.db"
USERNAME = "cador"
NEW_PASSWORD = "123456"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    hashed_password = pwd_context.hash(NEW_PASSWORD)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT id, username FROM usuarios WHERE username = ?", (USERNAME,))
    user = cur.fetchone()

    if not user:
        print(f"Usuário '{USERNAME}' não encontrado.")
        conn.close()
        return

    cur.execute(
        "UPDATE usuarios SET password = ? WHERE username = ?",
        (hashed_password, USERNAME),
    )
    conn.commit()
    conn.close()

    print(f"Senha do usuário '{USERNAME}' atualizada com sucesso.")
    print(f"Nova senha: {NEW_PASSWORD}")

if __name__ == "__main__":
    main()