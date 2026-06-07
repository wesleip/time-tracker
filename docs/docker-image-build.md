# Docker Image Build Process

Documentação do processo de geração e publicação de imagens Docker para o Time Tracker.
Cobre arquitetura das imagens, estratégia de tags, builds locais, pipeline CI/CD e decisões de design.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura das Imagens](#arquitetura-das-imagens)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estratégia de Tags](#estratégia-de-tags)
5. [Build Local](#build-local)
6. [Pipeline CI/CD](#pipeline-cicd)
7. [Registro de Imagens (GHCR)](#registro-de-imagens-ghcr)
8. [Suporte Multi-Arch](#suporte-multi-arch)
9. [OCI Labels](#oci-labels)
10. [Segurança](#segurança)
11. [Como Adaptar para Outro Registro](#como-adaptar-para-outro-registro)

---

## Visão Geral

O processo de build segue o modelo **GitOps**: qualquer merge na branch `main` ou criação de uma tag semântica (`v*.*.*`) dispara automaticamente o workflow de build e publicação de imagens no GitHub Actions.

```
Developer → git push / git tag → GitHub Actions → GHCR
                                      │
                              ┌───────┴───────┐
                              │               │
                         CI (testes)    Build & Push
                              │               │
                           pytest       docker buildx bake
                                              │
                                   ┌──────────┴──────────┐
                                   │                     │
                              API image           Frontend image
                           (FastAPI/Python)    (React/nginx)
                              amd64+arm64        amd64+arm64
```

---

## Arquitetura das Imagens

Ambas as imagens usam **multi-stage build** para minimizar o tamanho final e reduzir a superfície de ataque.

### API (`time-tracker-api`)

| Stage   | Base image               | Responsabilidade                          |
|---------|--------------------------|-------------------------------------------|
| builder | `python:3.12-alpine`     | Instala dependências Python em `/venv`    |
| runtime | `python:3.12-alpine`     | Copia apenas `/venv` + código da aplicação|

**Por que Alpine?**  
Alpine usa musl libc e tem ~5 MB de tamanho base. A imagem final da API fica em torno de 80–120 MB (vs. ~300 MB com Debian slim), o que reduz tempo de pull em clusters k8s e custo de armazenamento em registros.

**Por que venv separado no builder?**  
O venv é criado no builder e copiado para o runtime com `COPY --from=builder /venv /venv`. Isso evita que ferramentas de compilação (gcc, headers) fiquem na imagem final, que só precisa das bibliotecas Python já compiladas.

### Frontend (`time-tracker-frontend`)

| Stage   | Base image              | Responsabilidade                             |
|---------|-------------------------|----------------------------------------------|
| builder | `node:22-alpine`        | Executa `npm ci` + `npm run build` (Vite)    |
| runtime | `nginx:1.28-alpine`     | Serve os assets estáticos compilados         |

**Por que não incluir o Node no runtime?**  
O frontend é uma SPA estática após o build — não existe código Node rodando em produção. O nginx serve os arquivos de `/usr/share/nginx/html`. Incluir o Node aumentaria a imagem em ~150 MB sem nenhum benefício.

---

## Estrutura de Arquivos

```
time-tracker/
├── docker-bake.hcl                  # Configuração central de build (BuildKit Bake)
├── Makefile                         # Comandos de conveniência para builds locais
├── api/
│   ├── Dockerfile                   # Multi-stage: builder + runtime (Python/Alpine)
│   └── .dockerignore                # Exclui tests/, .env, __pycache__, etc.
├── frontend/
│   ├── Dockerfile                   # Multi-stage: builder (Node) + runtime (nginx)
│   └── .dockerignore                # Exclui node_modules/, dist/ local, .env, etc.
└── .github/
    └── workflows/
        ├── ci.yml                   # Roda pytest em PRs e pushes para main
        └── build-images.yml         # Builda e publica imagens multi-arch no GHCR
```

### Por que `docker-bake.hcl` e não `docker-compose build`?

`docker buildx bake` é o padrão Cloud Native para builds de imagens:
- Define todos os targets em um arquivo declarativo (HCL ou JSON)
- Suporta multi-arch nativamente
- Permite herança entre targets (ex: `api-release` herda de `api` + `_platforms_release`)
- Integra com GitHub Actions cache (`type=gha`)
- Não depende do Docker Compose para builds — o Compose continua sendo usado apenas para orquestração local

---

## Estratégia de Tags

A geração de tags é feita automaticamente pelo [`docker/metadata-action`](https://github.com/docker/metadata-action) com base no evento Git que disparou o workflow.

| Evento Git              | Tags geradas                              |
|-------------------------|-------------------------------------------|
| Push para `main`        | `:latest`, `:sha-abc1234`                 |
| Tag `v1.2.3`            | `:1.2.3`, `:1.2`, `:sha-abc1234`, `:latest` |
| Pull Request            | `:sha-abc1234` (build sem push)           |
| `workflow_dispatch`     | `:sha-abc1234` (push opcional via input)  |

**Raciocínio:**
- `:latest` facilita deploys em ambientes que não gerenciam versões explicitamente
- `:1.2.3` permite rollback preciso e auditoria
- `:1.2` permite que manifestos k8s recebam patches automaticamente sem mudança de configuração
- `:sha-abc1234` garante rastreabilidade total — sempre é possível saber exatamente qual commit originou uma imagem em produção

---

## Build Local

### Pré-requisitos

```bash
# Verificar versão do Docker (BuildKit requerido: Docker >= 23 ou Docker Desktop >= 4.19)
docker buildx version

# Verificar make
make --version
```

### Comandos disponíveis

```bash
# Ver variáveis resolvidas antes do build
make info

# Build das duas imagens para a plataforma atual (sem push)
make build

# Build multi-arch + push para o registro
make push

# Rodar suite de testes do backend
make test

# Remover imagens locais geradas
make clean
```

### Build com registry customizado

```bash
# Usar registro próprio
make build REGISTRY=myregistry.io/myorg/time-tracker

# Build de uma imagem específica
APP_VERSION=0.6.0 docker buildx bake api
```

### Build direto com bake (sem Makefile)

```bash
# Inspecionar configuração resolvida sem buildar
docker buildx bake --print

# Build local das duas imagens
docker buildx bake

# Build multi-arch com push (para release)
APP_VERSION=0.6.0 \
VCS_REF=$(git rev-parse --short HEAD) \
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
REGISTRY=ghcr.io/sua-org/time-tracker \
docker buildx bake release --push
```

---

## Pipeline CI/CD

### Workflow `ci.yml` — Integração Contínua

**Disparo:** Push para `main` ou PR com alterações em `api/**`

```
git push / PR → ci.yml
                   └── job: test
                           ├── checkout
                           ├── setup Python 3.12 (cache pip)
                           ├── pip install requirements.txt + requirements-dev.txt
                           └── pytest -v
```

Os testes usam SQLite in-memory (configurado em `api/tests/conftest.py` com `StaticPool`) — não há dependência de PostgreSQL em CI.

### Workflow `build-images.yml` — Build e Publicação

**Disparo:** Push para `main`, tags `v*.*.*`, ou `workflow_dispatch`

```
git push/tag → build-images.yml
                   ├── job: build-api (paralelo)
                   │       ├── checkout
                   │       ├── docker/metadata-action  ← gera tags e labels OCI
                   │       ├── setup-qemu-action        ← emulação ARM64
                   │       ├── setup-buildx-action      ← BuildKit
                   │       ├── login-action (GHCR)
                   │       └── build-push-action
                   │               ├── context: ./api
                   │               ├── platforms: linux/amd64, linux/arm64
                   │               ├── cache: type=gha,scope=api
                   │               └── push: true (exceto em PRs)
                   │
                   └── job: build-frontend (paralelo)
                           └── (mesma sequência com context: ./frontend)
```

Os dois jobs rodam **em paralelo** — o tempo total de CI é o do job mais lento, não a soma dos dois.

### Cache de layers no GitHub Actions

O `type=gha` (GitHub Actions Cache) exporta todos os layers BuildKit entre runs:

- **mode=max**: cacheia layers intermediários, não apenas a layer final. Isso significa que mudanças no código-fonte não invalidam o layer da instalação de dependências.
- **scope=api / scope=frontend**: isola os caches dos dois jobs para evitar conflitos.

Em builds subsequentes sem alteração em `requirements.txt`, o layer do `pip install` vem do cache — reduz o tempo de build de ~3 min para ~40 s.

---

## Registro de Imagens (GHCR)

O **GitHub Container Registry** (`ghcr.io`) foi escolhido por:
- Integração nativa com GitHub Actions via `GITHUB_TOKEN` (sem secrets extras)
- Gratuito para repositórios públicos e incluído no plano GitHub
- Suporte a multi-arch manifest lists
- Controle de acesso integrado com permissões do repositório

### URLs das imagens

```
ghcr.io/<github-owner>/time-tracker-api:<tag>
ghcr.io/<github-owner>/time-tracker-frontend:<tag>
```

Substitua `<github-owner>` pelo nome do usuário ou organização GitHub que hospeda o repositório.

### Configuração necessária

Nenhuma configuração manual de secrets é necessária para GHCR — o `GITHUB_TOKEN` gerado automaticamente em cada run tem permissão de escrita via:

```yaml
permissions:
  packages: write
```

Para tornar as imagens públicas após o primeiro push:
1. Acesse `github.com/<owner>/<repo>/pkgs/container/time-tracker-api`
2. Em "Package settings" → "Change visibility" → Public

---

## Suporte Multi-Arch

Ambas as imagens são compiladas para `linux/amd64` e `linux/arm64`.

| Plataforma     | Casos de uso                                               |
|----------------|------------------------------------------------------------|
| `linux/amd64`  | AWS EC2 (maioria), GCP, Azure, servidores x86_64 padrão   |
| `linux/arm64`  | AWS Graviton (EC2 t4g, m7g), Apple Silicon (dev local), ARM k8s nodes |

**Como funciona em CI:**
- O runner GitHub Actions é sempre `linux/amd64`
- O `setup-qemu-action` instala emulação QEMU para `arm64` no runner
- O BuildKit compila o layer `arm64` via emulação e o layer `amd64` nativo em paralelo
- O `build-push-action` cria um **manifest list** no registro que aponta para a imagem correta conforme a arquitetura do node que faz o pull

**Para builds locais:**
`make build` produz apenas a arquitetura do host (sem QEMU) — mais rápido para desenvolvimento. `make push` usa multi-arch.

---

## OCI Labels

Todas as imagens incluem os labels padrão da [OCI Image Specification](https://github.com/opencontainers/image-spec/blob/main/annotations.md):

| Label                                      | Valor                                |
|--------------------------------------------|--------------------------------------|
| `org.opencontainers.image.title`           | Nome da imagem                       |
| `org.opencontainers.image.description`     | Descrição curta                      |
| `org.opencontainers.image.version`         | Versão da aplicação (ex: `1.2.3`)    |
| `org.opencontainers.image.revision`        | Commit SHA completo                  |
| `org.opencontainers.image.created`         | Timestamp ISO 8601 do build          |
| `org.opencontainers.image.source`          | URL do repositório GitHub            |
| `org.opencontainers.image.licenses`        | SPDX license identifier              |

Esses labels são indexados por registros como Harbor, GHCR, ECR e GCR e permitem que operadores Kubernetes implementem políticas baseadas em metadados (ex: bloquear imagens sem `revision`, alertar sobre imagens com `created` > 90 dias).

Para inspecionar os labels de uma imagem:

```bash
docker inspect ghcr.io/sua-org/time-tracker-api:latest \
  | jq '.[0].Config.Labels'
```

---

## Segurança

### API

| Medida                        | Implementação                                                |
|-------------------------------|--------------------------------------------------------------|
| Non-root runtime              | `adduser -S app` + `USER app` no Dockerfile                  |
| Sem build tools no runtime    | Multi-stage: compilação no builder, apenas venv no runtime   |
| Tests excluídos da imagem     | `tests/` no `.dockerignore`                                  |
| `.env` excluído               | `.env` e `.env.*` no `.dockerignore`                         |
| Dependências sem range aberto | `requirements.txt` com versões exatas (gerado por Poetry)    |

### Frontend

| Medida                        | Implementação                                                |
|-------------------------------|--------------------------------------------------------------|
| Nginx worker não-root         | `user nginx;` em `nginx.conf` — workers rodam como `nginx`   |
| Node.js ausente no runtime    | Multi-stage: apenas o `dist/` compilado vai para o nginx      |
| `node_modules` excluído       | `.dockerignore` — recriado via `npm ci` dentro do builder    |
| `dist/` local excluído        | `.dockerignore` — evita servir assets desatualizados         |
| Rate limiting                 | `limit_req_zone` em `nginx.conf` (60 req/min por IP real)    |
| Security headers              | Configurados no `Caddyfile` (HSTS, X-Frame-Options, etc.)    |

### Pipeline

| Medida                              | Implementação                                          |
|-------------------------------------|--------------------------------------------------------|
| Sem secrets hard-coded              | `GITHUB_TOKEN` gerado por run, sem PATs manuais        |
| Push bloqueado em PRs               | `push: ${{ github.event_name != 'pull_request' }}`     |
| Permissões mínimas por job          | `permissions: contents: read, packages: write`         |
| Pinning de actions por versão maior | `actions/checkout@v4`, não `@main`                     |

---

## Como Adaptar para Outro Registro

Para usar AWS ECR, GCP Artifact Registry ou Docker Hub em vez de GHCR:

### 1. Atualizar a variável `REGISTRY` no `docker-bake.hcl`

```hcl
variable "REGISTRY" {
  default = "123456789.dkr.ecr.us-east-1.amazonaws.com/time-tracker"
}
```

### 2. Trocar o step de login no workflow

**AWS ECR:**
```yaml
- name: Log in to ECR
  uses: aws-actions/amazon-ecr-login@v2
```

**GCP Artifact Registry:**
```yaml
- name: Log in to Artifact Registry
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_CREDENTIALS }}
- uses: docker/login-action@v3
  with:
    registry: us-central1-docker.pkg.dev
    username: _json_key
    password: ${{ secrets.GCP_CREDENTIALS }}
```

**Docker Hub:**
```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

### 3. Atualizar `images:` no step de metadata

```yaml
images: 123456789.dkr.ecr.us-east-1.amazonaws.com/time-tracker-api
```

### 4. Atualizar o `Makefile`

```bash
make push REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com/time-tracker
```

---

## Referências

- [OCI Image Spec — Annotations](https://github.com/opencontainers/image-spec/blob/main/annotations.md)
- [Docker BuildKit Bake Reference](https://docs.docker.com/build/bake/reference/)
- [docker/metadata-action](https://github.com/docker/metadata-action)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
