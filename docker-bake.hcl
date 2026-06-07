# docker-bake.hcl — BuildKit Bake configuration
#
# Centralizes all image build targets in a single declarative file.
# Acts as the single source of truth for image names, build args,
# platforms and cache strategies — consumed by CI/CD and local builds.
#
# Prerequisites:
#   docker buildx version >= 0.10  (bundled with Docker Desktop >= 4.19)
#
# Quick reference:
#   Local build (current arch only):     docker buildx bake
#   Multi-arch build + push to registry: docker buildx bake release --push
#   Single image:                        docker buildx bake api
#   Override registry:                   REGISTRY=myregistry.io docker buildx bake
#   Inspect resolved config:             docker buildx bake --print

# ──────────────────────────────────────────────────────────────
# Variables — overridable via environment variables or --set flag
# ──────────────────────────────────────────────────────────────

variable "REGISTRY" {
  # Base registry path. In CI this is set to ghcr.io/<org>/time-tracker.
  # For local builds the default is fine — images stay in the local daemon.
  default = "ghcr.io/wesleip/time-tracker"
}

variable "APP_VERSION" {
  # Injected by CI from the git tag or commit SHA.
  # Embedded in image labels and the APP_VERSION env var at runtime.
  default = "dev"
}

variable "VCS_REF" {
  # Short commit SHA used for traceability (OCI label + runtime introspection).
  default = "unknown"
}

variable "BUILD_DATE" {
  # ISO 8601 timestamp of the build, set by CI.
  default = "unknown"
}

# ──────────────────────────────────────────────────────────────
# _common — shared build arguments injected into every target.
# Kept in a separate target so each image target inherits cleanly.
# ──────────────────────────────────────────────────────────────
target "_common" {
  args = {
    APP_VERSION = APP_VERSION
    VCS_REF     = VCS_REF
    BUILD_DATE  = BUILD_DATE
  }
}

# ──────────────────────────────────────────────────────────────
# _platforms_release — multi-arch platform list for release builds.
# Separated so local (single-arch) and release (multi-arch) targets
# can share the same Dockerfile configuration.
#
# linux/amd64  → AWS EC2, GCP, Azure, most managed Kubernetes nodes
# linux/arm64  → AWS Graviton, Apple Silicon dev machines, ARM k8s nodes
# ──────────────────────────────────────────────────────────────
target "_platforms_release" {
  platforms = ["linux/amd64", "linux/arm64"]
}

# ══════════════════════════════════════════════════════════════
# API — FastAPI backend (Python 3.12 / Alpine)
# ══════════════════════════════════════════════════════════════
target "api" {
  inherits   = ["_common"]
  context    = "./api"
  dockerfile = "Dockerfile"
  tags = [
    "${REGISTRY}-api:${APP_VERSION}",
    "${REGISTRY}-api:latest",
  ]
  # GitHub Actions cache — falls back to no-cache if not available
  cache-from = ["type=gha,scope=api"]
  cache-to   = ["type=gha,scope=api,mode=max"]
}

target "api-release" {
  inherits = ["api", "_platforms_release"]
}

# ══════════════════════════════════════════════════════════════
# Frontend — React SPA (Node 22 builder / nginx 1.28 runtime)
# ══════════════════════════════════════════════════════════════
target "frontend" {
  inherits   = ["_common"]
  context    = "./frontend"
  dockerfile = "Dockerfile"
  tags = [
    "${REGISTRY}-frontend:${APP_VERSION}",
    "${REGISTRY}-frontend:latest",
  ]
  cache-from = ["type=gha,scope=frontend"]
  cache-to   = ["type=gha,scope=frontend,mode=max"]
}

target "frontend-release" {
  inherits = ["frontend", "_platforms_release"]
}

# ══════════════════════════════════════════════════════════════
# Groups
# ══════════════════════════════════════════════════════════════

# default — builds both images for the current host platform.
# Used by developers running `docker buildx bake` locally.
# Images are loaded into the local Docker daemon (no --push needed).
group "default" {
  targets = ["api", "frontend"]
}

# release — multi-arch build targeting Cloud Native registries.
# Must be run with --push because multi-arch manifests cannot be
# loaded into the local daemon (they require a registry to store
# the manifest list that references per-arch images).
#
#   APP_VERSION=0.6.0 docker buildx bake release --push
group "release" {
  targets = ["api-release", "frontend-release"]
}
