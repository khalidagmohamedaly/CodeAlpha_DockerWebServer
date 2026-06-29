# CodeAlpha DevOps - Tâche 4 : Web Server using Docker
# Build multi-stage pour une image finale légère et sécurisée.

# ---- Étape 1 : build / installation des dépendances ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY app/package*.json ./
RUN npm install --omit=dev --no-fund --no-audit

COPY app/server.js ./

# ---- Étape 2 : image finale (runtime uniquement) ----
FROM node:20-alpine

# Bonnes pratiques sécurité : utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

USER appuser

EXPOSE 3000

# Healthcheck utilisé par `docker ps` et par les orchestrateurs
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
