# Time Tracker

Aplicação web para controle de horas trabalhadas em projetos.

Profissionais que atuam em múltiplos projetos (SRE, DevOps, desenvolvedores, consultores, analistas) podem registrar de forma simples e rápida quanto tempo foi gasto em cada atividade, consultar totais diários, semanais e mensais.

## Funcionalidades

- **Autenticação** — Registro e login multi-usuário com JWT; dados isolados por usuário
- **Dashboard** — Visão geral com totais de hoje, semana e mês; projetos e dias recentes
- **Registrar** — Apontamento diário com navegação entre dias, busca e CRUD de registros
- **Projetos** — CRUD com identificação visual por cores e busca
- **Relatório semanal** — Breakdown segunda–domingo com total por projeto
- **Relatório mensal** — Visão agregada por dia e por projeto
- **API REST** — 15 endpoints com autenticação JWT e validação Pydantic

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, React Hook Form, Zod, Axios |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn, PyJWT, passlib |
| **Banco** | PostgreSQL 16 |
| **Infra** | Docker Compose, Nginx, multi-stage builds |

## Estrutura do Projeto

```
/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # UI, layout e dashboard
│   │   ├── contexts/          # AuthContext (JWT + user state)
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── pages/             # Dashboard, TimeLog, Projetos, Semana, Relatório, Login, Register
│   │   ├── services/          # API client (Axios) com camelCase ↔ snake_case
│   │   ├── types/             # Interfaces TypeScript
│   │   └── utils/             # Formatação de datas (pt-BR)
│   ├── Dockerfile             # node:22-alpine → nginx:1.28-alpine
│   ├── nginx.conf             # SPA routing, gzip, API proxy
│   ├── vite.config.ts         # Plugins React + Tailwind, proxy /api
│   └── package.json
├── api/                       # FastAPI + Python
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py        # get_current_user dependency (JWT)
│   │   │   └── routes/        # auth, projects, entries, reports
│   │   ├── core/              # Config (Pydantic Settings), database, security (JWT + bcrypt)
│   │   ├── models/            # SQLAlchemy ORM (User, Project, TimeEntry)
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic request/response
│   │   ├── services/          # Business logic
│   │   └── main.py            # App factory, CORS, error handlers
│   ├── alembic/               # Database migrations
│   ├── tests/                 # pytest (18 testes: auth, projetos, registros)
│   ├── Dockerfile             # python:3.12-alpine
│   ├── pyproject.toml         # Poetry dependencies
│   └── run.py                 # Uvicorn dev runner
├── docs/                      # Documentação de negócio
├── design-system/             # Design tokens e guia visual
├── agents/                    # Diretrizes para agentes de IA
├── ARCHITECTURE.md
├── REQUIREMENTS.md
├── TASKS.md
├── CHANGELOG.md
└── compose.yaml               # Orquestração (db, api, frontend)
```

## API

### Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Criar conta |
| `POST` | `/api/auth/login` | Login — retorna JWT |
| `GET` | `/api/auth/me` | Dados do usuário autenticado |

> Todas as rotas abaixo exigem `Authorization: Bearer <token>`.

### Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |

### Projetos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/projects/` | Listar projetos do usuário |
| `POST` | `/api/projects/` | Criar projeto |
| `GET` | `/api/projects/{id}` | Buscar projeto por ID |
| `PUT` | `/api/projects/{id}` | Atualizar projeto |
| `DELETE` | `/api/projects/{id}` | Remover projeto |

### Registros de Horas

| Método | Rota | Query Params | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/entries/` | `date`, `project_id` | Listar registros |
| `POST` | `/api/entries/` | — | Criar registro |
| `GET` | `/api/entries/{id}` | — | Buscar registro por ID |
| `PUT` | `/api/entries/{id}` | — | Atualizar registro |
| `DELETE` | `/api/entries/{id}` | — | Remover registro |

### Relatórios

| Método | Rota | Query Params | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/reports/daily` | `report_date` | Resumo diário por projeto |
| `GET` | `/api/reports/weekly` | `report_date` | Resumo semanal (seg–dom) |
| `GET` | `/api/reports/monthly` | `month` | Relatório mensal por dia e projeto |

## Desenvolvimento

### Com Docker Compose (recomendado)

```bash
docker compose up --build
```

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| frontend | `http://localhost:8080` | Nginx servindo o build do React |
| api | `http://localhost:3001` | FastAPI + Uvicorn |
| db | `5432` (interno) | PostgreSQL |

### Frontend standalone

```bash
cd frontend
npm install
npm run dev     # → http://localhost:5173 (proxy /api → localhost:3001)
npm run build
```

### Backend standalone

```bash
cd api
poetry install
cp .env.example .env   # ajuste DATABASE_URL e JWT_SECRET
alembic upgrade head
python run.py          # → http://localhost:3001
```

### Testes

```bash
cd api
pip install pytest httpx   # ou: pip install -r requirements-dev.txt
pytest tests/ -v
```

## Arquitetura

### Backend

```
Routes → Services → Repositories → Models
```

- **Routes** — thin controllers, injetam `current_user` via `Depends`
- **Services** — regras de negócio, validações, 404s
- **Repositories** — acesso a dados via SQLAlchemy ORM, filtrados por `user_id`
- **Models** — `User`, `Project` (FK → User), `TimeEntry` (FK → Project)
- **Schemas** — validação e serialização Pydantic; horas validadas (0 < h ≤ 24)

### Frontend

```
Pages → Hooks (TanStack Query) → Services (Axios) → API
```

- **AuthContext** — estado do usuário, token em localStorage, interceptor 401
- **Hooks** — `useProjects`, `useEntries`, `useDailyReport`, `useWeeklyReport`, `useMonthlyReport`
- **Services** — interceptors convertem `camelCase ↔ snake_case` automaticamente
- **Components** — primitivos (`Button`, `Card`, `Input`, `Select`, `Badge`, `Modal`) + layout + dashboard

## Banco de Dados

### User

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | String(36) | PK, UUID |
| `email` | String(255) | NOT NULL, UNIQUE |
| `name` | String(255) | NOT NULL |
| `password_hash` | String(255) | NOT NULL |
| `created_at` | DateTime(tz) | default now |
| `updated_at` | DateTime(tz) | default now, auto-update |

### Project

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | String(36) | PK, UUID |
| `user_id` | String(36) | FK → users.id |
| `name` | String(255) | NOT NULL |
| `description` | Text | nullable |
| `color` | String(7) | NOT NULL, default `#6366f1` |
| `created_at` | DateTime(tz) | default now |
| `updated_at` | DateTime(tz) | default now, auto-update |

### TimeEntry

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | String(36) | PK, UUID |
| `project_id` | String(36) | FK → projects.id |
| `description` | Text | nullable |
| `hours` | Float | NOT NULL |
| `date` | DateTime(tz) | NOT NULL, indexed |
| `created_at` | DateTime(tz) | default now |
| `updated_at` | DateTime(tz) | default now, auto-update |

## Design System

Paleta baseada em sage green e blue-gray, tons pastel, tipografia Inter (400, 500, 600). Interface limpa e focada em produtividade. Referência completa em `design-system/design-system.md`.

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `PROJECT.md` | Problema, público-alvo, objetivo, escopo MVP |
| `REQUIREMENTS.md` | Requisitos funcionais e não-funcionais |
| `ARCHITECTURE.md` | Arquitetura e conceitos de domínio |
| `TASKS.md` | Roadmap e tarefas pendentes |
| `CHANGELOG.md` | Histórico de versões |
| `docs/api-spec.md` | Contrato da API REST |
| `docs/business-rules.md` | Regras de negócio |
| `agents/system-prompt.md` | Diretrizes para agentes de IA |
