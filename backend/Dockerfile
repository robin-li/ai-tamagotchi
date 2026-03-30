# ─── Build stage ───
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --ignore-scripts && npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ─── Production stage ───
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production --ignore-scripts && npx prisma generate

COPY --from=builder /app/dist ./dist/

USER appuser
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
