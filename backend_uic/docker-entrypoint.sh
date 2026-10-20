#!/bin/sh
set -e

echo "[uic] Preparando base de datos..."
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi

echo "[uic] Verificando superadmin..."
npx tsx prisma/seed.ts

echo "[uic] Iniciando API..."
exec node dist/main