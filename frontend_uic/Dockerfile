# ---------- Etapa 1: compilar ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# La URL de la API se "quema" en el build (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build

# ---------- Etapa 2: imagen final ----------
FROM node:24-bookworm-slim
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
USER node
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]