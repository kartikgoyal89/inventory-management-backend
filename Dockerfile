# ---- Backend Dockerfile (Node.js / Express / Mongoose) ----
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "src/server.js"]
