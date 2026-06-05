# Changelog

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
