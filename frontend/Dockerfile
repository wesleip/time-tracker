# syntax=docker/dockerfile:1
#
# Frontend — React SPA (Vite + TypeScript)
# Multi-stage build: builder compiles the SPA to static files;
# runtime serves them with nginx — no Node.js in the final image.
#
# Build args (injected by docker-bake.hcl / CI pipeline):
#   NODE_VERSION    — Node.js release used for compilation (default: 22)
#   NGINX_VERSION   — nginx release used for serving (default: 1.28)
#   APP_VERSION     — application version string embedded in OCI labels
#   VCS_REF         — git commit SHA for traceability
#   BUILD_DATE      — ISO 8601 build timestamp

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.28

# ──────────────────────────────────────────────────────────────
# Stage 1 · builder
# Compiles TypeScript and bundles assets with Vite.
# This stage is discarded — only /app/dist reaches the runtime image.
# ──────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copy lock file before source so this layer is only invalidated when
# dependencies change, not on every source code edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 2 · runtime
# Minimal nginx image serving the compiled static assets.
# The nginx master process runs as root (required to bind port 80);
# worker processes run as the `nginx` user — declared in nginx.conf.
# ──────────────────────────────────────────────────────────────
FROM nginx:${NGINX_VERSION}-alpine

ARG APP_VERSION=dev
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="Time Tracker Frontend" \
      org.opencontainers.image.description="React SPA served by nginx with rate limiting and security headers" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.source="https://github.com/your-org/time-tracker" \
      org.opencontainers.image.licenses="MIT"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure nginx worker (nginx user) can read the built assets.
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --spider -q http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
