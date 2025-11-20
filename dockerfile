# syntax=docker/dockerfile:1.7

# ----- Builder -----
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Cài deps
    COPY package*.json ./
    RUN npm ci
    
    # Copy code & build
    COPY . .
    ENV NODE_ENV=production
    # Ví dụ Vite env: thay bằng biến thực tế của bạn
    ARG VITE_API_URL=https://wuvynyiopwzwtesbiojf.supabase.co/functions/v1
    ARG VITE_SUPABASE_PROJECT_ID=wuvynyiopwzwtesbiojf
    ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...dJI
    ENV NODE_ENV=production \
        VITE_API_URL=${VITE_API_URL} \
        VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID} \
        VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

    RUN npm run build
    
    # ----- Runtime -----
    FROM nginx:1.27-alpine AS runtime
    # Nginx conf tối giản để phục vụ SPA
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy output dist sang nginx
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Healthcheck nhẹ
    HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
      CMD wget -qO- http://127.0.0.1/ || exit 1
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]