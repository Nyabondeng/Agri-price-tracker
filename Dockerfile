# Base image
FROM node:18-alpine

# Create and set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV API_VERSION=1

# Copy package files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Switch to the non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
