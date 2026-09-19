FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependência primeiro (melhor cache do Docker)
COPY package*.json ./

RUN npm install

# Copia o restante do código
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Comando de desenvolvimento com hot-reload
CMD ["npm", "run", "dev"]
