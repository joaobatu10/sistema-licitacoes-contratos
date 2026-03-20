import sqlite3

conn = sqlite3.connect("licitacoes.db")
cur = conn.cursor()

cur.execute("ALTER TABLE licitacoes ADD COLUMN quartel_29gacap BOOLEAN DEFAULT 0;")

conn.commit()
conn.close()

print("Coluna adicionada com sucesso")