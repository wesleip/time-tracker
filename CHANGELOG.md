# Changelog

## 0.5.0 (2026-06-05)

### Dashboard

- Dashboard (`/`) refeito como visão geral: stat cards hoje/semana/mês, projetos do mês ordenados por horas, últimos 5 dias com registros
- Página `TimeLog` (`/registrar`) criada com o fluxo anterior de apontamento diário
- Sidebar: novo item "Registrar" com ícone de relógio
- Empty state no Dashboard com link direto para `/registrar`

### Produção

- `compose.yaml`: secrets movidos para `.env` (falha rápida com `:?` se ausente); portas de api e frontend removidas do host
- `compose.override.yaml`: overrides de dev (expõe 8080/3001); merged automaticamente por `docker compose up`
- `Caddyfile`: reverse proxy com HTTPS automático (Let's Encrypt), security headers (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), log de acesso rotativo
- `nginx.conf`: config completa com `limit_req_zone` (60 req/min por IP real, burst 20, 429 no excesso), `set_real_ip_from` para ler IP real via `X-Forwarded-For` do Caddy, `server_tokens off`
- `.env.example`: template completo com instruções de geração de secrets
- `.gitignore`: `.env` adicionado

## 0.4.0 (2026-06-05)

### Auth

- Autenticação multi-usuário com JWT (PyJWT + passlib/bcrypt)
- Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Isolamento de dados por usuário: projetos e registros são visíveis apenas ao dono
- Frontend: AuthContext, páginas Login e Register, rotas protegidas com `ProtectedRoute`
- Token JWT armazenado em localStorage, enviado via Bearer em todas as requests
- Logout no sidebar com redirecionamento para login

### Backend

- Novo endpoint `GET /api/reports/weekly?report_date=YYYY-MM-DD`
- Fix timezone: filtro de registros por data agora é timezone-aware (America/Sao_Paulo)
- `EntryRepository.monthly_summary` → `period_summary` (reutilizado pelo relatório semanal)
- Adicionado `user_id` no modelo `Project` (FK → users)
- Migração Alembic: tabela `users` + `projects.user_id`

### Frontend

- Sidebar responsiva com menu hamburger em mobile e overlay
- Error states (`isError`) em Dashboard, Projetos e Relatório Mensal
- Confirmação de dois passos ao excluir projeto (cascade-delete)
- Busca/filtro client-side em Dashboard e Projetos
- Página Semana com navegação por semana (segunda–domingo)
- Componente `Select` com suporte a `placeholder`; formulários unificados usando `Select`
- Rota `/semana` adicionada na sidebar e no `App.tsx`

### Testes

- 18 testes pytest cobrindo: auth, isolamento de usuários, CRUD de projetos, CRUD de registros
- `conftest.py` com SQLite in-memory (StaticPool) e fixture `auth_headers`
- `requirements-dev.txt` com pytest + httpx

### Deps

- Adicionado: PyJWT 2.9.0, passlib 1.7.4, bcrypt 4.0.1
- bcrypt fixado em `<4.1.0` por incompatibilidade com passlib 1.7.4

## 0.3.0 (2025-06-05)

### Backend

- API REST com Express 5 + TypeScript
- SQLite via sql.js (WASM, sem dependências nativas)
- Schema: projetos e registros com índices
- Seed data automática (5 projetos, 10 registros)
- Endpoints: CRUD de projetos, CRUD de registros, relatório diário e mensal
- Dockerfile multi-stage (node:22-alpine)
- Healthcheck na rota `/api/health`

### Integração

- Frontend agora consome API real via `services/client.ts`
- Proxy do Vite configurado (`/api` → `localhost:3001`)
- Proxy do Nginx configurado (`/api/` → `api:3001`)
- `compose.yaml` com serviço `api`
- Mock data removido (dados agora são gerados pelo backend)

## 0.2.0 (2025-06-05)

### Estrutura

- Frontend movido para `/frontend`
- Diretório `/api` criado para backend futuro
- `compose.yaml` atualizado com novo caminho do frontend
- README.md atualizado com estrutura do projeto

### Frontend

- Scaffold Vite + React 19 + TypeScript
- Configuração Tailwind CSS v4 com tokens do design system
- Tipos e interfaces (Project, TimeEntry, DailySummary, MonthlyReport)
- Mock data e camada de serviços mockados
- Componentes base: Button, Card, Input, Select, Badge, Modal
- Layout: Sidebar com navegação, Header, Shell
- Página Dashboard com visão diária, navegação entre dias e CRUD de registros
- Página Projetos com grid de cards e CRUD via modal
- Página Relatório Mensal com navegação entre meses e total por projeto
- Utilitários de formatação de data/hora (pt-BR)
- Roteamento com react-router-dom

## 0.1.0

- Estrutura inicial criada
