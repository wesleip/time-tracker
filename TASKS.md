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

## Futuro

- [ ] Exportar CSV
- [ ] Exportar PDF
- [ ] Timesheet automático
- [ ] Integração Jira
- [ ] Integração Azure DevOps
- [ ] Reordenar seções (drag ou up/down)
- [ ] Sugerir registro de tempo ao concluir tarefa com projeto
- [ ] Testes frontend (Vitest)
- [ ] Refresh token
- [ ] Paginação de registros
