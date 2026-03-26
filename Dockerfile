# syntax=docker/dockerfile:1

# Node 22 Alpine: fresher musl/busybox fixes than older 18.x tags at scan time.
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Refresh Alpine packages (addresses many Trivy CRITICAL/HIGH findings on stale bases).
RUN apk update && apk upgrade --no-cache

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs src ./src

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
