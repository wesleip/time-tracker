# Time Tracker

Aplicação web para controle de horas trabalhadas em projetos e tarefas.

Profissionais que atuam em múltiplos projetos (SRE, DevOps, desenvolvedores, consultores, analistas) podem registrar de forma simples e rápida quanto tempo foi gasto em cada atividade, consultar totais diários e gerar relatórios mensais.

## Funcionalidades

- **Projetos** — CRUD completo com identificação visual por cores
- **Registro de horas** — Vincular horas a projetos com descrição e data
- **Dashboard diário** — Navegação entre dias com total de horas e lista de registros
- **Relatório mensal** — Visão agregada por dia e por projeto
- **API REST** — 12 endpoints documentados com validação Pydantic

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form, Zod, Axios |
| **Backend** | Python 3.12, FastAPI, Pydantic, SQLAlchemy 2.0, Alembic, Uvicorn |
| **Banco** | PostgreSQL 16 |
| **Infra** | Docker Compose, Nginx, multi-stage builds |

## Estrutura do Projeto

```
/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # UI, layout e dashboard
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── pages/             # Dashboard, Projetos, Relatório Mensal
│   │   ├── services/          # API client (Axios)
│   │   ├── types/             # Interfaces TypeScript
│   │   └── utils/             # Formatação de datas (pt-BR)
│   ├── Dockerfile             # node:22-alpine → nginx:1.28-alpine
│   ├── nginx.conf             # SPA routing, gzip, API proxy
│   ├── vite.config.ts         # Plugins React + Tailwind, proxy /api
│   └── package.json
├── api/                       # FastAPI + Python
│   ├── app/
│   │   ├── api/routes/        # projects, entries, reports
│   │   ├── core/              # Config (Pydantic Settings), database
│   │   ├── models/            # SQLAlchemy ORM (Project, TimeEntry)
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic request/response
│   │   ├── services/          # Business logic
│   │   └── main.py            # App factory, CORS, error handlers
│   ├── alembic/               # Database migrations
│   ├── Dockerfile             # python:3.12-alpine
│   ├── pyproject.toml         # Poetry dependencies
│   └── run.py                 # Uvicorn dev runner
├── docs/                      # Business documentation
│   ├── api-spec.md            # REST API contract
│   ├── business-rules.md      # Regras de negócio
│   ├── glossary.md            # Definições de termos
│   └── user-stories.md        # User stories
├── design-system/             # Design tokens e guia visual
│   └── design-system.md       # Cores, tipografia, componentes, espaçamento
├── agents/                    # Instruções para agentes de IA
│   ├── system-prompt.md       # System prompt e regras de implementação
│   ├── architecture-principles.md  # KISS, YAGNI, DRY, SOLID
│   ├── security.md            # OWASP Top 10, security guidelines
│   ├── containerization.md    # Docker best practices
│   ├── coding-guidelines.md
│   ├── development-rules.md
│   ├── definition-of-done.md
│   └── review-checklist.md
├── ARCHITECTURE.md            # Arquitetura do sistema
├── REQUIREMENTS.md            # Requisitos funcionais e não-funcionais
├── WORKFLOW.md                # Fluxo de uso
├── TASKS.md                   # Roadmap e tarefas pendentes
├── CHANGELOG.md               # Histórico de versões
└── compose.yaml               # Orquestração (db, api, frontend)
```

## API

### Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |

### Projetos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/projects/` | Listar todos os projetos |
| `POST` | `/api/projects/` | Criar projeto |
| `GET` | `/api/projects/{id}` | Buscar projeto por ID |
| `PUT` | `/api/projects/{id}` | Atualizar projeto |
| `DELETE` | `/api/projects/{id}` | Remover projeto |

### Registros de Horas

| Método | Rota | Query Params | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/entries/` | `date`, `project_id` | Listar registros (filtros opcionais) |
| `POST` | `/api/entries/` | — | Criar registro |
| `GET` | `/api/entries/{id}` | — | Buscar registro por ID |
| `PUT` | `/api/entries/{id}` | — | Atualizar registro |
| `DELETE` | `/api/entries/{id}` | — | Remover registro |

### Relatórios

| Método | Rota | Query Params | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/reports/daily` | `report_date` | Resumo diário com totais por projeto |
| `GET` | `/api/reports/monthly` | `month` | Relatório mensal com breakdown por dia e projeto |

## Desenvolvimento

### Com Docker Compose (recomendado)

```bash
docker compose up --build
```

Isso inicia três serviços em ordem:

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| frontend | `http://localhost:8080` | Nginx servindo o build do React |
| api | `http://localhost:3001` | FastAPI + Uvicorn |
| db | `5432` (interno) | PostgreSQL (não exposto externamente) |

### Frontend standalone

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173 (proxy /api → localhost:3001)
npm run build        # Build para produção em dist/
npm run preview      # Preview do build
```

### Backend standalone

```bash
cd api
poetry install
# Configure DATABASE_URL no .env (copie de .env.example)
alembic upgrade head # Executar migrações
python run.py        # → http://localhost:3001 (uvicorn com reload)
```

## Arquitetura

### Backend

Camadas organizadas do externo para o interno:

```
Routes → Services → Repositories → Models
```

- **Routes**: Controllers thin, delegam para services
- **Services**: Regras de negócio, validações, tratamento de 404
- **Repositories**: Acesso a dados via SQLAlchemy ORM
- **Models**: Entidades SQLAlchemy com relacionamentos
- **Schemas**: Validação e serialização via Pydantic

### Frontend

```
Pages → Hooks (TanStack Query) → Services (Axios) → API
```

- **Pages**: Componentes de página com estado de UI
- **Hooks**: `useProjects`, `useEntries` com queries e mutations
- **Services**: Funções de chamada à API com transformação camelCase ↔ snake_case
- **Components**: UI primitives, layout, e componentes de domínio

## Banco de Dados

### Project

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `name` | String(255) | NOT NULL |
| `description` | Text | nullable |
| `color` | String(7) | NOT NULL, default `#6366f1` |
| `created_at` | DateTime(tz) | default now |
| `updated_at` | DateTime(tz) | default now, auto-update |

### TimeEntry

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `project_id` | UUID | FK → projects.id |
| `description` | Text | nullable |
| `hours` | Float | NOT NULL |
| `date` | DateTime(tz) | NOT NULL, indexed |
| `created_at` | DateTime(tz) | default now |
| `updated_at` | DateTime(tz) | default now, auto-update |

## Design System

Paleta baseada em sage green e blue-gray, tons pastel, tipografia Inter (400, 500, 600). Interface limpa e focada em produtividade.

Referência completa em `design-system/design-system.md`.

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `PROJECT.md` | Problema, público-alvo, objetivo, escopo MVP |
| `REQUIREMENTS.md` | Requisitos funcionais e não-funcionais |
| `ARCHITECTURE.md` | Arquitetura, conceitos de domínio, regras |
| `WORKFLOW.md` | Fluxo de uso da aplicação |
| `TASKS.md` | Roadmap: MVP completo, tarefas futuras |
| `CHANGELOG.md` | Histórico de versões |
| `docs/api-spec.md` | Contrato completo da API REST |
| `docs/business-rules.md` | Regras de negócio |
| `docs/glossary.md` | Definições de termos |
| `agents/system-prompt.md` | System prompt e regras para agentes de IA |
