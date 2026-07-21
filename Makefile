# Makefile — local developer commands for Docker image operations
#
# All build commands use `docker buildx bake` (docker-bake.hcl) so that
# local and CI builds share the same configuration. BuildKit is required.
#
# Prerequisites:
#   docker buildx version  → docker buildx version
#   make                   → make --version
#
# Usage:
#   make              → same as `make build`
#   make build        → build api + frontend for the current platform
#   make build-api    → build API only
#   make build-frontend → build frontend only
#   make push         → multi-arch build and push to registry
#   make push-api     → push API multi-arch to registry
#   make push-frontend → push frontend multi-arch to registry
#   make up           → start full stack with compose
#   make up-api       → start API stack only (DB + API)
#   make up-frontend  → start frontend stack only (requires running API)
#   make down         → stop all services
#   make down-api     → stop API stack
#   make down-frontend → stop frontend stack
#   make test         → run backend test suite
#   make clean        → remove locally built images
#   make info         → print resolved build variables

# ──────────────────────────────────────────────────────────────
# Build variables — all overridable from the environment
# ──────────────────────────────────────────────────────────────

# APP_VERSION: prefer the latest git tag; fall back to "dev"
APP_VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")

# VCS_REF: short commit SHA for traceability
VCS_REF ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# BUILD_DATE: ISO 8601 UTC timestamp
BUILD_DATE ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

# REGISTRY: target container registry path (without image name suffix)
# Override for your own registry: make push REGISTRY=myregistry.io/myorg/time-tracker
REGISTRY ?= ghcr.io/wesleip/time-tracker

# Internal env block passed to every bake invocation
BAKE_ENV = APP_VERSION=$(APP_VERSION) VCS_REF=$(VCS_REF) BUILD_DATE=$(BUILD_DATE) REGISTRY=$(REGISTRY)

.DEFAULT_GOAL := build
.PHONY: build build-api build-frontend push push-api push-frontend up up-api up-frontend down down-api down-frontend test clean info

# ──────────────────────────────────────────────────────────────
# build — compile both images for the current host platform.
# ──────────────────────────────────────────────────────────────
build:
	$(BAKE_ENV) docker buildx bake

# ──────────────────────────────────────────────────────────────
# build-api — compile API image only
# ──────────────────────────────────────────────────────────────
build-api:
	$(BAKE_ENV) docker buildx bake api

# ──────────────────────────────────────────────────────────────
# build-frontend — compile frontend image only
# ──────────────────────────────────────────────────────────────
build-frontend:
	$(BAKE_ENV) docker buildx bake frontend

# ──────────────────────────────────────────────────────────────
# push — build multi-arch images and push to the registry.
# ──────────────────────────────────────────────────────────────
push:
	$(BAKE_ENV) docker buildx bake release --push

# ──────────────────────────────────────────────────────────────
# push-api — push API multi-arch image to registry
# ──────────────────────────────────────────────────────────────
push-api:
	$(BAKE_ENV) docker buildx bake api-release --push

# ──────────────────────────────────────────────────────────────
# push-frontend — push frontend multi-arch image to registry
# ──────────────────────────────────────────────────────────────
push-frontend:
	$(BAKE_ENV) docker buildx bake frontend-release --push

# ──────────────────────────────────────────────────────────────
# up — start full stack (DB + API + Frontend + Caddy)
# ──────────────────────────────────────────────────────────────
up: down
	docker compose -f compose.yml -f compose.api.yml -f compose.frontend-full.yml up -d

# ──────────────────────────────────────────────────────────────
# up-api — start API stack only (DB + API)
# ──────────────────────────────────────────────────────────────
up-api: down-api
	docker compose -f compose.yml -f compose.api.yml up -d

# ──────────────────────────────────────────────────────────────
# up-frontend — start frontend stack only (requires running API)
# ──────────────────────────────────────────────────────────────
up-frontend: down-frontend
	docker compose -f compose.yml -f compose.frontend.yml up -d

# ──────────────────────────────────────────────────────────────
# down — stop all services
# ──────────────────────────────────────────────────────────────
down:
	docker compose -f compose.yml -f compose.api.yml -f compose.frontend.yml down

# ──────────────────────────────────────────────────────────────
# down-api — stop API stack
# ──────────────────────────────────────────────────────────────
down-api:
	docker compose -f compose.api.yml down || true

# ──────────────────────────────────────────────────────────────
# down-frontend — stop frontend stack
# ──────────────────────────────────────────────────────────────
down-frontend:
	docker compose -f compose.frontend.yml down || true

# ──────────────────────────────────────────────────────────────
# restart — restart a specific service (e.g., make restart SERVICE=api)
# ──────────────────────────────────────────────────────────────
restart:
	@docker compose -f compose.yml -f compose.api.yml -f compose.frontend.yml restart $(SERVICE)

# ──────────────────────────────────────────────────────────────
# logs — follow logs for a specific service or all
# ──────────────────────────────────────────────────────────────
logs:
	@docker compose -f compose.yml -f compose.api.yml -f compose.frontend.yml logs -f $(SERVICE)

# ──────────────────────────────────────────────────────────────
# test — run the backend test suite with pytest.
# ──────────────────────────────────────────────────────────────
test:
	cd api && pytest -v --tb=short

# ──────────────────────────────────────────────────────────────
# clean — remove locally built images for the current version.
# ──────────────────────────────────────────────────────────────
clean:
	docker image rm -f \
		$(REGISTRY)-api:$(APP_VERSION) \
		$(REGISTRY)-api:latest \
		$(REGISTRY)-frontend:$(APP_VERSION) \
		$(REGISTRY)-frontend:latest \
		2>/dev/null || true

# ──────────────────────────────────────────────────────────────
# info — print all resolved build variables before running a build.
# ──────────────────────────────────────────────────────────────
info:
	@echo ""
	@echo "  APP_VERSION : $(APP_VERSION)"
	@echo "  VCS_REF     : $(VCS_REF)"
	@echo "  BUILD_DATE  : $(BUILD_DATE)"
	@echo "  REGISTRY    : $(REGISTRY)"
	@echo ""
	@echo "  API image    : $(REGISTRY)-api:$(APP_VERSION)"
	@echo "  Frontend img : $(REGISTRY)-frontend:$(APP_VERSION)"
	@echo ""
