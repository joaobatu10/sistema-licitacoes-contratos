#!/usr/bin/env sh
set -e

mkdir -p /data

if [ ! -f /data/licitacoes.db ] && [ -f /app/licitacoes.db ]; then
  cp /app/licitacoes.db /data/licitacoes.db
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"