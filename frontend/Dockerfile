FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Vite dev server com host 0.0.0.0 para funcionar dentro do Docker
CMD ["npm", "run", "dev"]
