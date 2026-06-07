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
#   make push         → multi-arch build and push to registry
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
.PHONY: build push test clean info

# ──────────────────────────────────────────────────────────────
# build — compile both images for the current host platform.
#
# Images are loaded into the local Docker daemon (no push).
# Use this for iterating locally before opening a PR.
# ──────────────────────────────────────────────────────────────
build:
	$(BAKE_ENV) docker buildx bake

# ──────────────────────────────────────────────────────────────
# push — build multi-arch images and push to the registry.
#
# Targets linux/amd64 and linux/arm64 simultaneously using the
# `release` group defined in docker-bake.hcl. Requires registry
# credentials (docker login or GHCR token).
#
# --push is mandatory for multi-arch: multi-platform manifest lists
# cannot be loaded into the local daemon; they must live in a registry.
# ──────────────────────────────────────────────────────────────
push:
	$(BAKE_ENV) docker buildx bake release --push

# ──────────────────────────────────────────────────────────────
# test — run the backend test suite with pytest.
#
# Tests use SQLite in-memory (see api/tests/conftest.py) so no
# running PostgreSQL instance is required.
# ──────────────────────────────────────────────────────────────
test:
	cd api && pytest -v --tb=short

# ──────────────────────────────────────────────────────────────
# clean — remove locally built images for the current version.
# Does not remove :latest tags or registry-pushed images.
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
# Use this to verify that overrides are applied correctly.
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
