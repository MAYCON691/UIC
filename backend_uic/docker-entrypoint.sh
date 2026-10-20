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
if [ -f dist/main.js ]; then
  exec node dist/main.js
elif [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
else
  echo "[uic] ERROR: no se encontro main.js dentro de dist. Contenido:"
  find dist -name "main.js" || true
  exit 1
fi