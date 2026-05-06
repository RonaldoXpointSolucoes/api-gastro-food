# Usar imagem Node.js leve
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar os arquivos de dependência primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar as dependências de produção
RUN npm ci --only=production

# Copiar o resto do código da aplicação
COPY . .

# Expor a porta que a aplicação roda
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "src/server.js"]
