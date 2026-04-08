FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependências
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build final
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Criar diretório de logs
RUN mkdir -p logs

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
