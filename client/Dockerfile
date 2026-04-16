# ============ CLIENT DOCKERFILE ============
# Multi-stage build: Build React app, serve with Nginx

# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies — delete package-lock and use npm install 
# to get correct platform-specific binaries (fixes Rollup Alpine bug)
RUN rm -f package-lock.json && npm install

# Copy source code
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the built files from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
