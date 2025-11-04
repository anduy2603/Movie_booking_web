# Multi-stage build for React + Vite client

# Stage 1: Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Lightningcss-win32 đã được xóa khỏi package.json nên không cần --omit=optional
RUN npm ci

# Copy source code (for production build)
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing and optimization
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

