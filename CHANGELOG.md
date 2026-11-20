# Changelog

## 0.7.0 (2026-07-27)

### Tarefas

- Novos modelos `Section` e `Task` (migração `a1b2c3d4e5f6`)
- Endpoints CRUD de tarefas + `PATCH /tasks/{id}/toggle` e `/complete`
- Recorrência diária, semanal e mensal: ao concluir, a próxima ocorrência é criada com `parent_id`
- Seção padrão "Geral" criada automaticamente na primeira listagem/criação
- Prioridade 1–4 com cor e ordenação (urgente → baixa, concluídas ao final)
- Página Tarefas com filtros de status e seção, busca e destaque de atrasadas / vence hoje
- Vínculo opcional de tarefa com projeto: seletor no formulário, filtro por projeto na listagem e badge do projeto no card
- Filtros rápidos por prazo: "Hoje", "Amanhã", "Esta semana" (segunda–domingo) e "Próxima semana"
- Reordenação de seções com botões ↑/↓ na tela de Tarefas; os grupos passam a seguir a ordem configurada das seções ("Sem seção" por último)
- Seções sem tarefas passam a aparecer na lista (quando não há filtro ativo), para poderem ser reordenadas, editadas ou excluídas — antes só apareciam as seções que tinham tarefas
- Ao concluir uma tarefa com projeto vinculado, a aplicação sugere registrar as horas: modal com horas, data (vencimento da tarefa ou hoje) e descrição (título da tarefa), usando `POST /entries/`. Fechar o modal não registra nada
- Concluir tarefa pela tela passa a chamar `PATCH /tasks/{id}/complete` em vez de `/toggle`: só o endpoint de conclusão processa a recorrência, que portanto não funcionava pela interface. Reabrir continua usando `/toggle`
- `toISODate`/`todayISO` movidos para `src/utils/date.ts` e reaproveitados pela tela de Tarefas
- Correção do tratamento de data na tela de Tarefas: `new Date("YYYY-MM-DD")` é interpretado como UTC e deslocava um dia em fusos negativos (UTC-3). No Brasil, a tarefa que vence hoje aparecia como "(atrasada)" e com a data de ontem. Agora as datas são comparadas como texto local

### Notificações

- Modelo `Notification` e migração `b2c3d4e5f6a1`
- Endpoints: listar, criar, contador de não lidas, marcar uma/todas como lidas, remover
- Tipos: `task_reminder`, `task_overdue`, `task_due_today`, `system`
- Sino de notificações no frontend com contador

### Admin

- Campo `is_admin` em `users` (migração `5a1b2c3d4e5f`) e dependência de rota em `/api/admin/*`
- Endpoints: overview, usuários (listar, toggle-admin, remover), projetos (listar, remover), timelogs
- Telas de administração com `AdminRoute`

### Testes

- 22 novos testes: tarefas (CRUD, filtros, recorrência, isolamento), seções (incluindo o destino das tarefas ao excluir a seção), notificações (contador, leitura, isolamento) e smoke do admin
- Suite backend passa de 18 para 40 testes
- Testes no frontend com Vitest (jsdom + Testing Library): 22 testes cobrindo datas locais, filtro de prazo por tarefas e um componente de UI. `npm test` entra no job de frontend do CI
- Lógica de filtro por prazo extraída da tela de Tarefas para `src/utils/taskFilters.ts` — testável sem DOM

### Infra

- `compose.api.yml` e `compose.frontend.yml` sem `profiles:`: incluir o arquivo no `-f` passa a subir a stack (antes qualquer `docker compose up` sem `--profile` subia só o `db`)
- Rede e volume definidos de forma idêntica nos três arquivos — fim do `external: true` que exigia criar `time-tracker-network`/`time-tracker-pgdata` à mão
- `compose.frontend-full.yml` removido: só adicionava `depends_on`, que não é necessário (Nginx resolve `/api` em tempo de request)
- `compose.override.yaml` removido: como o Compose carrega `compose.override.yaml` automaticamente, o deploy de produção (`docker compose -f compose.yaml up -d`) recebia `DEBUG=true` e as portas 3001/8080 sem querer. As portas de dev agora ficam em `compose.api.yml`/`compose.frontend.yml`, que são stacks de desenvolvimento; produção continua em `compose.yaml`
- `make up`, `down`, `up-api`, `down-api`, `up-frontend`, `restart` e `logs` usam o mesmo conjunto de arquivos de cada stack
- `.github/workflows/ci.yml`: novo job `frontend` (Node 24) com `npm ci`, `npm run lint` e `npm run build`; o workflow passa a disparar também com mudanças em `frontend/**`. Antes o lint do frontend podia quebrar sem ninguém notar, já que o CI só rodava pytest em mudanças de `api/**`
- `frontend/nginx.conf`: upstream do `/api` resolvido em tempo de request (`resolver 127.0.0.11` + `proxy_pass` com variável). Antes, subir o frontend sem a API no mesmo network matava o container com `host not found in upstream`

### Segurança

- `JWT_SECRET` passa a ser obrigatório: removido o fallback `"change-this-secret-in-production"` de `app/core/config.py`. Sem a variável, a API falha na inicialização em vez de assinar tokens com segredo público
- `conftest.py` define `JWT_SECRET` de teste antes de carregar as settings; CI já fornecia a variável

### Frontend

- `npm run lint` volta a passar sem erros (a Definition of Done exige "sem erros de lint"):
  - `AuthContext`: `isLoading` nasce a partir da existência do token, em vez de `setState` síncrono dentro de `useEffect`
  - `useAuth` movido para `src/hooks/useAuth.ts` e o contexto para `src/contexts/auth-context.ts` — arquivos que exportam componente agora exportam só componente (regra `react-refresh/only-export-components`)
  - `AdminTimeLogs` migrada para TanStack Query (`useAdminUsers`/`useAdminTimeLogs`), igual às demais telas, dispensando os `useEffect` manuais

### Banco

- `projects.user_id` passa a ser `NOT NULL` (migração `c3d4e5f6a7b8`). Projetos criados antes da autenticação multi-usuário são reatribuídos ao usuário mais antigo — o único dono plausível dos dados pré-auth — em vez de ficarem órfãos e invisíveis para todo mundo. Se existirem projetos órfãos e nenhum usuário cadastrado, a migração falha com mensagem explícita (o operador atribui o dono e roda de novo) em vez de aceitar a coluna opcional em silêncio

### Correções

- Excluir uma seção não apaga mais as tarefas: elas passam para "Sem seção" (`section_id` nulo), como o `REQUIREMENTS.md` previa. O `cascade="all, delete-orphan"` da relação `Section.tasks` foi removido e o `SectionService` agora libera as tarefas antes de excluir a seção

### Paginação

- `GET /api/tasks/` e `GET /api/entries/` aceitam `limit` (1–200) e `offset` (≥0). Sem `limit` a rota continua devolvendo tudo, então nenhum consumidor existente quebra
- O total da consulta (respeitando os filtros) vai no header `X-Total-Count`, exposto no CORS
- Tela de Tarefas passa a carregar 50 por vez, com botão "Carregar mais" e contador "Mostrando X de Y"; trocar de filtro volta para a primeira página

### Relatórios

- Tela de Relatório Mensal ganha botão **Exportar CSV** (um registro por dia/projeto, mais a linha de total), com `;` como separador, vírgula decimal e BOM UTF-8 — abre direto no Excel e no LibreOffice em pt-BR sem ajuste de importação. Geração no navegador: sem endpoint novo e sem dependência

### Documentação

- `ARCHITECTURE.md`, `docs/api-spec.md`, `docs/glossary.md` e `README.md` sincronizados com o código
- `REQUIREMENTS.md` com escopo explícito (módulo de Tarefas) e status conferido item a item

## 0.6.0 (2026-06-07)

### CI/CD — Geração de Imagens Docker

- `docker-bake.hcl`: configuração central de build com BuildKit Bake; targets `api`, `frontend`, grupos `default` (single-arch local) e `release` (multi-arch amd64+arm64 para push ao registro)
- `.github/workflows/ci.yml`: pipeline pytest em PRs e pushes para `main` com SQLite in-memory (sem dependência de PostgreSQL em CI)
- `.github/workflows/build-images.yml`: build e publicação de imagens multi-arch no GHCR com estratégia de tags semânticas (`:1.2.3`, `:1.2`, `:sha-abc`, `:latest`), cache de layers via `type=gha` e jobs de API e frontend em paralelo
- `Makefile`: comandos locais `build`, `push`, `test`, `clean`, `info` — todos delegam ao `docker buildx bake`
- `api/Dockerfile`: OCI labels (`org.opencontainers.image.*`), build args `APP_VERSION`/`VCS_REF`/`BUILD_DATE`, `.dockerignore` expandido (exclui `tests/`, `requirements-dev.txt`, `run.py`)
- `frontend/Dockerfile`: OCI labels, build args, `.dockerignore` expandido (exclui `dist/` local, `.vite/`, `node_modules/`)
- `docs/docker-image-build.md`: documentação completa — arquitetura multi-stage, estratégia de tags, pipeline CI/CD, suporte multi-arch, OCI labels, segurança e guia de migração para outros registros (ECR, GCR, Docker Hub)

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
