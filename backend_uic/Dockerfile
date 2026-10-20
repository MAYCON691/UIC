# ---------- Etapa 1: compilar ----------
FROM node:24-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---------- Etapa 2: imagen final ----------
FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --chown=node:node package*.json ./
COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh \
    && mkdir -p /app/uploads \
    && chown node:node /app/uploads
USER node
EXPOSE 4000
CMD ["./docker-entrypoint.sh"]