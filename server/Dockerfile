# ============ SERVER DOCKERFILE ============
# Production-ready Node.js container for Electroland API
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (leverages Docker layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the API port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api-docs || exit 1

# Start the server (using node instead of nodemon for production)
CMD ["node", "server.js"]
