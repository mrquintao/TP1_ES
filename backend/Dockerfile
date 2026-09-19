FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependência primeiro (melhor cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Gera o Prisma Client
RUN npx prisma generate

# Copia o restante do código
COPY . .

EXPOSE 3000

# Comando de desenvolvimento: sincroniza o banco e inicia com hot-reload
CMD ["sh", "-c", "npx prisma db push && node --watch src/server.js"]
