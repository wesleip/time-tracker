# API - Especificação

Contratos da API REST utilizada pelo frontend.

## Base URL

```
http://localhost:3001/api
```

---

## Projetos

### Listar projetos

```
GET /projects
```

Resposta:

```json
[
  {
    "id": "p1",
    "name": "Plataforma de Pagamentos",
    "color": "blue",
    "createdAt": "2025-01-10"
  }
]
```

### Criar projeto

```
POST /projects
```

Body:

```json
{
  "name": "Novo Projeto",
  "color": "green"
}
```

Resposta:

```json
{
  "id": "p6",
  "name": "Novo Projeto",
  "color": "green",
  "createdAt": "2025-06-05"
}
```

### Atualizar projeto

```
PUT /projects/:id
```

Body:

```json
{
  "name": "Nome Atualizado",
  "color": "blue"
}
```

### Excluir projeto

```
DELETE /projects/:id
```

---

## Registros de Horas

### Listar registros por data

```
GET /entries?date=2025-06-05
```

Resposta:

```json
[
  {
    "id": "e1",
    "projectId": "p1",
    "date": "2025-06-05",
    "hours": 2.5,
    "description": "Code review dos PRs",
    "createdAt": "2025-06-05T09:00:00"
  }
]
```

### Criar registro

```
POST /entries
```

Body:

```json
{
  "projectId": "p1",
  "date": "2025-06-05",
  "hours": 2.5,
  "description": "Descrição da atividade"
}
```

### Atualizar registro

```
PUT /entries/:id
```

Body:

```json
{
  "projectId": "p1",
  "date": "2025-06-05",
  "hours": 3.0,
  "description": "Nova descrição"
}
```

### Excluir registro

```
DELETE /entries/:id
```

---

## Relatório Mensal

### Obter relatório do mês

```
GET /reports/monthly?month=2025-06
```

Resposta:

```json
{
  "month": "2025-06",
  "totalHours": 45.5,
  "projects": [
    {
      "projectId": "p1",
      "projectName": "Plataforma de Pagamentos",
      "projectColor": "blue",
      "totalHours": 20.0
    }
  ]
}
```

---

## Resumo Diário

### Obter resumo do dia

```
GET /reports/daily?date=2025-06-05
```

Resposta:

```json
{
  "date": "2025-06-05",
  "totalHours": 8.5,
  "entries": [
    {
      "id": "e1",
      "projectId": "p1",
      "date": "2025-06-05",
      "hours": 2.5,
      "description": "Code review",
      "createdAt": "2025-06-05T09:00:00"
    }
  ]
}
```

---

## Tipos

### Project

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | sim | Identificador único |
| name | string | sim | Nome do projeto |
| color | enum | sim | Cor de identificação (`green`, `blue`, `orange`, `purple`, `lime`) |
| createdAt | string (date) | sim | Data de criação (ISO 8601) |

### TimeEntry

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | string | sim | Identificador único |
| projectId | string | sim | ID do projeto relacionado |
| date | string (date) | sim | Data do registro (YYYY-MM-DD) |
| hours | number | sim | Horas trabalhadas (fracionado, ex: 2.5) |
| description | string | sim | Descrição da atividade |
| createdAt | string (datetime) | sim | Timestamp de criação (ISO 8601) |
