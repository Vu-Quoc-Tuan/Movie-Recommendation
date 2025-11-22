# syntax=docker/dockerfile:1.7

# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY .npmrc ./
COPY package.json ./
RUN npm install

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
ENV NODE_ENV=production

# Build arguments for environment variables
ARG VITE_API_URL=/api
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV NODE_ENV=production

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:1.27-alpine AS production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]