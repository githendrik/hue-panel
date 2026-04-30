# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Persistent data volume (bridge config + timers stored here)
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV HUE_STORAGE_PATH=/app/data
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy the Nitro standalone output (server + public assets)
COPY --from=builder /app/.output .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
