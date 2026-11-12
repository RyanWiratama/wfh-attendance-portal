# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx nest build common && \
    npx nest build employee-service && \
    npx nest build auth-service && \
    npx nest build attendance-service && \
    npx nest build backend

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Create uploads directory for attendance photo storage
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000 4001 4002 4003

CMD ["node", "dist/apps/backend/main.js"]
