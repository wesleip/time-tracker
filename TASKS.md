# Tasks

## MVP

- [x] Estruturar projeto
- [x] Criar entidade Projeto
- [x] Criar entidade Registro
- [x] Criar tela de lançamento
- [x] Criar dashboard
- [x] Criar relatório mensal

## Melhorias (implementadas)

- [x] Autenticação multi-usuário com JWT
- [x] Isolamento de dados por usuário
- [x] Sidebar responsiva (mobile) e recolhível
- [x] Error states em todas as páginas
- [x] Confirmação ao excluir projeto (cascade delete)
- [x] Resumo semanal (frontend + backend)
- [x] Busca/filtro de registros e projetos (client-side)
- [x] Componente Select unificado em todos os formulários
- [x] Fix timezone em filtro de registros
- [x] Testes backend (pytest): auth, projetos, registros, tarefas, seções, notificações e admin
- [x] requirements.txt sincronizado com pyproject.toml
- [x] CI/CD: build multi-arch no GHCR via `docker buildx bake`
- [x] Tarefas: CRUD, seções, prioridade, vencimento, busca
- [x] Recorrência de tarefas (diária, semanal, mensal)
- [x] Notificações de tarefas vencidas / do dia
- [x] Painel administrativo (usuários, projetos, registros)
- [x] Sugerir registro de tempo ao concluir tarefa com projeto
- [x] Reordenação de seções e navegação rápida de data na tela de Tarefas
- [x] Seções vazias visíveis na lista de tarefas
- [x] Paginação de registros e tarefas (`limit`/`offset` + header `X-Total-Count`)
- [x] Testes frontend (Vitest): datas locais, filtro de prazo e componentes de UI
- [x] Exportar CSV do relatório mensal (gerado no navegador, sem endpoint novo)
- [x] Timesheet automático (visão Planilha do Relatório Mensal: dias × projetos)
- [x] Revogação de sessão: `POST /auth/logout` invalida os tokens do usuário (`users.token_version`)
- [x] Exportar PDF do relatório mensal (`GET /api/reports/monthly/pdf`, gerador próprio sem dependência nova)

## Futuro

- [ ] Integração Jira — precisa de credenciais (base URL, e-mail, API token e project key) para ser validada de verdade
- [ ] Integração Azure DevOps — idem: organização, PAT e URL do board
- [ ] Refresh token — adiado: o access token já dura 7 dias e agora o logout revoga de verdade, então o ganho seria só encurtar a janela de exposição. Um refresh de verdade exige tabela `refresh_tokens`, rotação com detecção de reuso, `/auth/refresh` e interceptor no axios (enfileirando requisições concorrentes)
