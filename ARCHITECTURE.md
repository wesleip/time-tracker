# Arquitetura

## Visão geral

SPA React servida por Nginx, API FastAPI, PostgreSQL. Em produção, Caddy é o único ponto de entrada (HTTPS) e faz proxy para o frontend; o Nginx encaminha `/api/*` para a API. Detalhes de stack e deploy no `README.md`.

## Backend — camadas

```
Routes → Services → Repositories → Models
                ↑
             Schemas
```

| Camada | Responsabilidade |
|---|---|
| `api/app/api/routes/` | Controllers finos: recebem request, injetam `current_user` via `Depends`, chamam o service |
| `api/app/services/` | Regras de negócio, validações, 404, recorrência de tarefas |
| `api/app/repositories/` | Acesso a dados via SQLAlchemy ORM, **sempre** filtrado por `user_id` |
| `api/app/models/` | Mapeamento ORM das entidades |
| `api/app/schemas/` | Validação e serialização Pydantic (request/response) |
| `api/app/core/` | Configuração, engine/sessão, JWT e hash de senha |

Regra: lógica de negócio não fica em route; query não fica em service.

## Frontend — camadas

```
Pages → Hooks (TanStack Query) → Services (Axios) → API
```

| Camada | Responsabilidade |
|---|---|
| `frontend/src/pages/` | Telas; uma por rota |
| `frontend/src/hooks/` | Cache e mutações TanStack Query |
| `frontend/src/services/` | Cliente Axios; converte `camelCase ↔ snake_case` e injeta o Bearer |
| `frontend/src/components/` | UI primitiva, layout e blocos de dashboard |
| `frontend/src/contexts/` | `AuthContext` (usuário + token) |

## Modelo de dados

| Entidade | Tabela | Relacionamentos |
|---|---|---|
| `User` | `users` | 1:N com projects, sections, tasks, notifications |
| `Project` | `projects` | → `users.id` (nullable no schema atual); 1:N com entries e tasks; `ON DELETE CASCADE` |
| `TimeEntry` | `time_entries` | → `projects.id` |
| `Section` | `sections` | → `users.id`; 1:N com tasks (ao excluir a seção, as tarefas vão para "Sem seção") |
| `Task` | `tasks` | → `users.id`, `sections.id`, `projects.id`, `tasks.id` (`parent_id`, recorrência) |
| `Notification` | `notifications` | → `users.id` |

IDs são UUID v4 em `String(36)`. Datas são `TIMESTAMP WITH TIME ZONE`, gravadas em `America/Sao_Paulo`. Schema versionado por Alembic (`api/alembic/versions/`).

## Fluxos transversais

- **Autenticação** — `POST /api/auth/login` devolve JWT (HS256, validade configurável); `get_current_user` valida o Bearer em toda rota protegida.
- **Isolamento por usuário** — aplicado no repositório, não na tela: toda query filtra `user_id`. Acesso a UUID de outro usuário retorna 404.
- **Admin** — `users.is_admin` + dependência de rota em `/api/admin/*`.
- **Recorrência** — ao concluir uma `Task` com `recurrence`, o service cria a próxima ocorrência e liga via `parent_id`.
- **Notificações** — criadas pela API a partir de tarefas vencidas/do dia; frontend consulta contador de não lidas.

## Regras de negócio

Ver `docs/business-rules.md`. Regra estrutural: a soma das horas de um dia pode ser maior ou menor que 8 — o sistema apenas registra.
