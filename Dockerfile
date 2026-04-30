# Multi-stage Dockerfile for Next.js 16 + SQLite (better-sqlite3)

# Stage 1: Builder
FROM node:20-alpine AS builder

# Install build tools for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Setup database for build-time prerendering
ENV DATABASE_URL=file:/app/dev.db
RUN npx prisma migrate deploy || true
RUN npx prisma db seed || true

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for better-sqlite3 and healthcheck
RUN apk add --no-cache libc6-compat wget

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Create directory for uploads
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/dev.db

# Create startup script
RUN printf '%s\n' '#!/bin/sh' 'cd /app' 'npx prisma migrate deploy || true' 'exec node server.js' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
