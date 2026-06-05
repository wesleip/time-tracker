FROM python:3.12-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libpq tzdata
COPY requirements.txt .
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-alpine

RUN apk add --no-cache libpq tzdata && \
    addgroup -S app && adduser -S app -G app

COPY --from=builder /venv /venv
ENV PATH="/venv/bin:$PATH"

WORKDIR /app
COPY --chown=app:app . .

USER app
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:3001/api/health')"

CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 3001
