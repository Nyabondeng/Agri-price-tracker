# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY agriprice-ghana/frontend/package*.json ./
RUN npm ci

COPY agriprice-ghana/frontend/ ./

# API calls use relative /api path so the app works on any domain
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Production image with backend + built frontend
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk upgrade --no-cache

COPY agriprice-ghana/backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY agriprice-ghana/backend/ ./

# Copy built React app to be served as static files
COPY --from=frontend-builder /frontend/dist ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "src/server.js"]
