
FROM node:24-bookworm-slim

WORKDIR /app

# Ferramentas para dependências nativas do SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar o código, sem os arquivos excluídos pelo .dockerignore
COPY . .
COPY backup-banco.js ./backup-banco.js

# Configurar o banco antes de executar o Prisma
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"

# Gerar o cliente Prisma
RUN npx prisma generate

# Preparar o diretório do banco persistente
RUN mkdir -p /app/data

EXPOSE 3000

# Aplicar migrations, cadastrar produtos e iniciar a API
CMD ["sh", "docker-entrypoint.sh"]
