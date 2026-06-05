# Time Tracker

Aplicação para controle de horas trabalhadas em projetos e tarefas.

## Estrutura

```
/
├── frontend/          # Aplicação React + TypeScript + Vite
│   ├── src/           # Código fonte
│   ├── public/        # Assets estáticos
│   ├── Dockerfile     # Container para produção
│   └── nginx.conf     # Configuração do Nginx
├── api/               # API (em desenvolvimento)
│   └── src/           # Código fonte
├── design-system/     # Design tokens e guia visual
├── docs/              # Documentação
│   ├── api-spec.md    # Contratos da API
│   └── business-rules.md
├── agents/            # Instruções para agentes de IA
└── compose.yaml       # Orquestração Docker
```

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **API:** Em definição
- **Container:** Docker, Nginx

## Desenvolvimento

```bash
cd frontend
npm run dev
```

## Build

```bash
cd frontend
npm run build
```
