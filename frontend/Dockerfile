FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de configuração primeiro
COPY package*.json ./

# Instala as ferramentas
RUN npm install

# AGORA copia todos os outros arquivos do sistema
COPY . .

# Cria a pasta de construção (o filme para o projetor)
RUN npm run build

# Produção com nginx
FROM nginx:alpine

# Pega o resultado da construção e entrega para o Nginx
# Se a pasta não for 'build', trocaremos para 'dist' depois
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
