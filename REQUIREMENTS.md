# Requisitos — Sistema de Tarefas

> **Escopo deste documento:** apenas o módulo de Tarefas (tasks, seções, recorrência, prioridade e lembretes). Não é o requisito geral da aplicação. Autenticação, projetos, registros de horas, relatórios e admin estão descritos no `README.md`.

## Visão Geral

Sistema de gerenciamento de tarefas pessoais (todo list) inspirado em Todoist e Microsoft ToDo, com foco em simplicidade e produtividade. Integra-se ao time tracker existente, permitindo que usuários gerenciem suas tarefas diárias sem sair da aplicação.

## Funcionalidades

### Tarefas (Tasks)

- [x] Criar tarefa com título (obrigatório) e descrição (opcional)
- [x] Editar tarefa (título, descrição, prioridade, data de vencimento)
- [x] Excluir tarefa
- [x] Marcar como concluída / reabrir
- [x] Visualizar lista de tarefas com filtros
- [ ] Filtrar por: todas, hoje, semana, concluídas
- [x] Filtrar por seção
- [x] Busca por título/descrição

### Seções (Sections)

- [x] Criar seção (nome obrigatório)
- [x] Editar seção (nome, cor)
- [ ] Excluir seção (move tarefas para "Sem seção")
- [ ] Reordenar seções (drag ou up/down)
- [x] Seção padrão "Geral" criada automaticamente

### Recorrência

- [x] Definir recorrência: diária, semanal, mensal
- [x] Ao concluir tarefa recorrente, criar próxima ocorrência automaticamente
- [x] Manter referência da tarefa original (parent_id)

### Prioridade

- [x] 4 níveis: baixa, média, alta, urgente
- [x] Representação visual por cor/número (1-4)
- [x] Ordenação padrão: urgente → alta → média → baixa

### Datas

- [x] Data de vencimento (due_date) opcional
- [x] Destaque visual para tarefas vencidas
- [x] Destaque visual para vence hoje
- [ ] Navegação rápida: hoje, amanhã, próxima semana

### Integração com Time Tracker

- [ ] Vincular tarefa a um projeto existente (opcional)
- [ ] Ao concluir tarefa com projeto vinculado, sugerir registro de tempo
- [ ] Filtro "Vinculadas ao projeto X" na listagem

> **Status (conferido no código em 2026-07):** o modelo e a API aceitam `project_id` e expõem filtro por projeto, mas a interface de Tarefas não oferece seletor de projeto nem filtro. Excluir uma seção **apaga** as tarefas dela (`cascade="all, delete-orphan"`), enquanto este documento prevê movê-las para "Sem seção". Ambos os pontos ficam em aberto no `TASKS.md`.

## API Endpoints

### Tasks

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/tasks/` | Listar tarefas (filtros: status, section_id, due_date, search) |
| `POST` | `/api/tasks/` | Criar tarefa |
| `GET` | `/api/tasks/{id}` | Buscar tarefa |
| `PUT` | `/api/tasks/{id}` | Atualizar tarefa |
| `DELETE` | `/api/tasks/{id}` | Excluir tarefa |
| `PATCH` | `/api/tasks/{id}/toggle` | Toggle concluída/pendente |
| `PATCH` | `/api/tasks/{id}/complete` | Marcar concluída (processa recorrência se aplicável) |

### Sections

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/sections/` | Listar seções do usuário |
| `POST` | `/api/sections/` | Criar seção |
| `PUT` | `/api/sections/{id}` | Atualizar seção |
| `DELETE` | `/api/sections/{id}` | Excluir seção |

## Modelo de Dados

### Task

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `section_id` | UUID | FK → sections (nullable) |
| `project_id` | UUID | FK → projects (nullable) |
| `parent_id` | UUID | FK → tasks (nullable, para recorrência) |
| `title` | String(255) | Título da tarefa |
| `description` | Text | Descrição (nullable) |
| `status` | Enum | `pending`, `completed` |
| `priority` | Int | 1-4 (1=urgent, 4=low) |
| `due_date` | Date | Data de vencimento (nullable) |
| `recurrence` | Enum | `null`, `daily`, `weekly`, `monthly` |
| `completed_at` | DateTime | Quando foi concluída (nullable) |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

### Section

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `name` | String(100) | Nome da seção |
| `color` | String(7) | Cor hex (default `#6366f1`) |
| `order` | Int | Ordem de exibição |
| `created_at` | DateTime | |

## Não Funcionais

- Interface simples e limpa (design system existing)
- Performance: listagem < 100ms para até 1000 tarefas
- Responsivo (mobile-friendly)
- Sem dependências externas além das existentes
- Atalhos de teclado para ações comuns
