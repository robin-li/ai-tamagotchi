# ─── Build stage ───
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install --ignore-scripts && npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ─── Production stage ───
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install --omit=dev --ignore-scripts && npx prisma generate

COPY --from=builder /app/dist ./dist/

# Fix permissions
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 3002

# prisma migrate deploy uses prisma.config.ts which reads DATABASE_URL from env
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
