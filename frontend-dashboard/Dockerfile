# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Run TypeScript checks and Next.js static export
RUN npx tsc --noEmit && npm run build

# Production Static Serving Stage
FROM nginx:alpine AS runner

COPY --from=builder /app/out /usr/share/nginx/html

# Custom nginx configuration for SPA routing and asset caching
RUN echo 'server { \
    listen 3000; \
    location /_next/static/ { \
        root /usr/share/nginx/html; \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    location ~* \.(pdf|png|jpg|jpeg|gif|ico|svg|webp)$ { \
        root /usr/share/nginx/html; \
        expires 1h; \
        add_header Cache-Control "public, max-age=3600, must-revalidate"; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
