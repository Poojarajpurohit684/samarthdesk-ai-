# --- Build Stage ---
FROM node:18-slim AS builder

# Install core build dependencies for Prisma engine stability
RUN apt-get update -y && apt-get install -y openssl openssh-client

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
COPY . .

RUN npx prisma generate && npm run build

# --- Production Stage ---
FROM node:18-slim
# Explicitly keep OpenSSL available in the running environment
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Gather distribution maps from builder phase
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["npm", "run", "start:migrate"]
