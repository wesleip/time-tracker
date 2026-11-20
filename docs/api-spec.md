# API — Contrato

Contrato resumido da API REST. A fonte de verdade é o OpenAPI gerado pelo FastAPI:

- Swagger UI: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/openapi.json`

Base URL: `http://localhost:3001/api` (em produção, atrás do Caddy: `/api`).

## Autenticação

Todas as rotas, exceto `POST /auth/register`, `POST /auth/login` e `GET /health`, exigem:

```
Authorization: Bearer <token>
```

O token vem de `POST /auth/login`. Cada usuário só enxerga os próprios dados (filtro por `user_id` no repositório). Rotas `/admin/*` exigem `is_admin`.

O token carrega a versão de sessão do usuário (`ver`), comparada com `users.token_version` a cada requisição. `POST /auth/logout` incrementa essa versão e invalida **todos** os tokens já emitidos para o usuário — inclusive os de outros dispositivos. Tokens antigos, sem `ver`, são tratados como versão 0 e continuam válidos até expirar.

## Convenções

| Item | Padrão |
|------|--------|
| JSON | `snake_case` (ex.: `project_id`, `total_hours`) |
| IDs | UUID v4 em string (`String(36)`) |
| Datas | ISO 8601; `date` aceita `YYYY-MM-DD` |
| Fuso | `America/Sao_Paulo` — datas sem tz são interpretadas nele |
| Cor de projeto | string hex (`#6366f1`), não enum |
| `hours` | float, `0 < hours <= 24`, arredondado a 2 casas |
| Coleções | barra final obrigatória: `/projects/`, `/entries/` |
| Paginação | `limit` (1–200) e `offset` (≥0) em `/tasks/` e `/entries/`. Sem `limit`, a rota devolve tudo (compatibilidade). O total da consulta vem no header `X-Total-Count` |

## Rotas

### Auth — 3

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cria conta — devolve token |
| `POST` | `/auth/login` | Login — devolve token |
| `GET` | `/auth/me` | Usuário autenticado |
| `POST` | `/auth/logout` | Revoga os tokens do usuário (204) |

### Health — 1

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Healthcheck (sem auth) |

### Projetos — 5

| Método | Rota | Descrição |
|---|---|---|
| `GET`/`POST` | `/projects/` | Listar / criar |
| `GET`/`PUT`/`DELETE` | `/projects/{id}` | Detalhar / atualizar / remover (cascade nos registros) |

### Registros de horas — 5

| Método | Rota | Query params | Descrição |
|---|---|---|---|
| `GET` | `/entries/` | `date`, `project_id`, `limit`, `offset` | Listar (inclui `project_name` e `project_color`) |
| `POST` | `/entries/` | — | Criar |
| `GET`/`PUT`/`DELETE` | `/entries/{id}` | — | Detalhar / atualizar / remover |

### Relatórios — 3

| Método | Rota | Query params | Descrição |
|---|---|---|---|
| `GET` | `/reports/daily` | `report_date=YYYY-MM-DD` | Total do dia por projeto |
| `GET` | `/reports/weekly` | `report_date=YYYY-MM-DD` | Semana seg–dom que contém a data |
| `GET` | `/reports/monthly` | `month=YYYY-MM` | Total do mês por dia e por projeto |
| `GET` | `/reports/monthly/pdf` | `month=YYYY-MM` | Mesmo relatório em PDF (`application/pdf`, download) |

### Tarefas — 7

| Método | Rota | Descrição |
|---|---|---|
| `GET`/`POST` | `/tasks/` | Listar (filtros: status, section_id, due_date, search, project_id, `limit`, `offset`) / criar |
| `GET`/`PUT`/`DELETE` | `/tasks/{id}` | Detalhar / atualizar / remover |
| `PATCH` | `/tasks/{id}/toggle` | Alterna pendente/concluída |
| `PATCH` | `/tasks/{id}/complete` | Conclui e gera a próxima ocorrência se recorrente |

### Seções — 4

| Método | Rota | Descrição |
|---|---|---|
| `GET`/`POST` | `/sections/` | Listar / criar |
| `PUT`/`DELETE` | `/sections/{id}` | Atualizar / remover (tarefas ficam sem seção) |

### Notificações — 6

| Método | Rota | Descrição |
|---|---|---|
| `GET`/`POST` | `/notifications/` | Listar / criar |
| `GET` | `/notifications/unread-count` | Contador de não lidas |
| `PATCH` | `/notifications/{id}/read` | Marcar uma como lida |
| `PATCH` | `/notifications/read-all` | Marcar todas como lidas |
| `DELETE` | `/notifications/{id}` | Remover |

### Admin — 7 (requer `is_admin`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin/overview` | Totais gerais |
| `GET` | `/admin/users` | Listar usuários |
| `PATCH` | `/admin/users/{id}/toggle-admin` | Conceder/remover admin |
| `DELETE` | `/admin/users/{id}` | Remover usuário |
| `GET` | `/admin/projects` | Listar projetos de todos os usuários |
| `DELETE` | `/admin/projects/{id}` | Remover projeto |
| `GET` | `/admin/timelogs` | Registros de todos os usuários |

Total: **41 rotas**.

## Exemplos

### `GET /entries/?date=2025-06-05`

```json
[
  {
    "id": "7f1c9a2e-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
    "project_id": "c2a1e0d4-9f3b-4a8c-b7e6-5d4c3b2a1f0e",
    "description": "Code review dos PRs",
    "hours": 2.5,
    "date": "2025-06-05T00:00:00-03:00",
    "created_at": "2025-06-05T09:00:00-03:00",
    "updated_at": "2025-06-05T09:00:00-03:00",
    "project_name": "Plataforma de Pagamentos",
    "project_color": "#6366f1"
  }
]
```

### `GET /reports/monthly?month=2025-06`

```json
{
  "month": "2025-06",
  "total_hours": 45.5,
  "days": [
    {
      "date": "2025-06-05",
      "total_hours": 8.5,
      "projects": [
        {
          "project_id": "c2a1e0d4-9f3b-4a8c-b7e6-5d4c3b2a1f0e",
          "project_name": "Plataforma de Pagamentos",
          "project_color": "#6366f1",
          "total_hours": 8.5,
          "entries_count": 3
        }
      ]
    }
  ]
}
```
