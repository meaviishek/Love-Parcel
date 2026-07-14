# ─────────────────────────────────────────
# Stage 1: Base dependencies
# ─────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# --ignore-scripts skips `postinstall: prisma generate` (schema not available yet)
RUN npm ci --omit=dev --ignore-scripts

# ─────────────────────────────────────────
# Stage 2: Build (Prisma generate)
# ─────────────────────────────────────────
FROM base AS builder
WORKDIR /app
# Copy prisma schema FIRST so prisma generate can find it
COPY prisma ./prisma
COPY . .
# Install ALL deps (including devDeps) then generate Prisma client
RUN npm ci --ignore-scripts
RUN npx prisma generate

# ─────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Copy production node_modules
COPY --from=builder /app/node_modules ./node_modules
# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy source
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY package*.json ./

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
