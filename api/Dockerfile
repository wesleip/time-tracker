# syntax=docker/dockerfile:1
#
# API — FastAPI backend
# Multi-stage build: builder installs Python deps into a venv;
# runtime copies only the venv + app code, keeping the image minimal.
#
# Build args (injected by docker-bake.hcl / CI pipeline):
#   PYTHON_VERSION  — Python release to pin (default: 3.12)
#   APP_VERSION     — application version string embedded in OCI labels
#   VCS_REF         — git commit SHA for traceability
#   BUILD_DATE      — ISO 8601 build timestamp

ARG PYTHON_VERSION=3.12

# ──────────────────────────────────────────────────────────────
# Stage 1 · builder
# Installs all Python dependencies into an isolated venv.
# This stage is discarded in the final image — it only exists to
# produce /venv without leaving build tools in the runtime layer.
# ──────────────────────────────────────────────────────────────
FROM python:${PYTHON_VERSION}-alpine AS builder

WORKDIR /app

# libpq: PostgreSQL client library required by psycopg2-binary at runtime.
# tzdata: timezone database — needed for America/Sao_Paulo conversions.
RUN apk add --no-cache libpq tzdata

COPY requirements.txt .
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir --upgrade pip && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

# ──────────────────────────────────────────────────────────────
# Stage 2 · runtime
# Minimal image: only the venv + app source + system runtime libs.
# Runs as a non-root user (app:app) — no capabilities required.
# ──────────────────────────────────────────────────────────────
FROM python:${PYTHON_VERSION}-alpine

ARG APP_VERSION=dev
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

# OCI image specification labels — indexed by Harbor, GHCR, ECR, GCR, ACR
# and consumed by Kubernetes operators for automated policy enforcement.
LABEL org.opencontainers.image.title="Time Tracker API" \
      org.opencontainers.image.description="FastAPI backend — authentication, project and time-entry management" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.source="https://github.com/your-org/time-tracker" \
      org.opencontainers.image.licenses="MIT"

RUN apk add --no-cache libpq tzdata && \
    addgroup -S app && adduser -S app -G app

# Copy the pre-built virtual environment from the builder stage.
# No pip or compiler needed at runtime.
COPY --from=builder /venv /venv
ENV PATH="/venv/bin:$PATH"

# Expose version at runtime for introspection (e.g. /api/health response).
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app
COPY --chown=app:app . .

USER app
EXPOSE 3001

# Healthcheck used by Docker Compose and — when not using exec probes —
# by Kubernetes liveness/readiness checks via the Docker shim.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:3001/api/health')"

# alembic runs schema migrations before uvicorn starts.
# Safe for single-replica deployments. For multi-replica (Kubernetes),
# extract this into a separate init container or Job to avoid race conditions.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 3001"]
