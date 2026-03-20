#!/usr/bin/env sh
set -e

mkdir -p /data

if [ "${RESTORE_DB:-0}" = "1" ] && [ -f /app/licitacoes.db ]; then
  cp -f /app/licitacoes.db /data/licitacoes.db
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000