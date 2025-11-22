# syntax=docker/dockerfile:1.7

# ----- Builder -----
  FROM node:20-slim AS builder
  WORKDIR /app
  
  # Cài deps
  COPY .npmrc ./
  COPY package.json ./
  RUN npm install

  # Copy code & build
  COPY . .
  ENV NODE_ENV=production
  
  # Hardcode Vite env vars
  ARG VITE_API_URL=/api

  ENV NODE_ENV=production \
      VITE_API_URL=${VITE_API_URL} \
      VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID} \
      VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
  
  RUN npm run build
  
  # ----- Runtime -----
  FROM nginx:1.27-alpine AS runtime
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  
  
  COPY --from=builder /app/build /usr/share/nginx/html
  
  HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1
  
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]