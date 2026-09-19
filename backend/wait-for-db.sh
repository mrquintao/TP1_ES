#!/bin/sh
# wait-for-db.sh — Espera o PostgreSQL ficar pronto antes de iniciar o backend
# Evita erro de conexão quando o backend sobe antes do banco

echo "⏳ Aguardando o PostgreSQL ficar pronto..."

# Tenta conectar ao PostgreSQL a cada 2 segundos, até 30 tentativas
MAX_RETRIES=30
RETRIES=0

while [ $RETRIES -lt $MAX_RETRIES ]; do
  # Usa node para testar a conexão (sem depender de pg_isready)
  node -e "
    import pg from '@prisma/client';
    const p = new pg.PrismaClient();
    p.\$connect().then(() => { p.\$disconnect(); process.exit(0); }).catch(() => process.exit(1));
  " 2>/dev/null

  if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL está pronto!"
    exec "$@"
    exit 0
  fi

  RETRIES=$((RETRIES + 1))
  echo "  Tentativa $RETRIES/$MAX_RETRIES..."
  sleep 2
done

echo "❌ PostgreSQL não ficou pronto a tempo!"
exit 1
