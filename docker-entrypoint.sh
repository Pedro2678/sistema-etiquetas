
#!/bin/sh
set -e

echo "Aplicando migrations do banco..."
npx prisma migrate deploy

echo "Cadastrando os cinco tipos de peças..."
npm run db:seed

echo "Iniciando a API..."
exec npm start
