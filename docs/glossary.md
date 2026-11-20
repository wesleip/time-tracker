# Glossário

Termos e definições utilizados no projeto.

## Time Tracker

Aplicação para registro e acompanhamento de horas trabalhadas em projetos.

## Projeto

Unidade de trabalho que agrupa registros de horas. Exemplos: "Plataforma de Pagamentos", "App Cliente Mobile".

### Atributos
- **Nome**: identificação do projeto
- **Cor**: cor hex de identificação visual (ex.: `#6366f1`), usada em badge/indicador — nunca como fundo de tela

## Registro (ou Lançamento)

Entrada individual de horas trabalhadas em um projeto em uma data específica.

### Atributos
- **Projeto**: projeto ao qual o registro pertence
- **Data**: dia em que o trabalho foi realizado
- **Horas**: quantidade de horas trabalhadas (fracionada, ex.: 2.5; entre 0 e 24)
- **Descrição**: resumo da atividade realizada

## Dashboard

Tela inicial (`/`) com os totais de hoje, semana e mês, projetos do mês e últimos dias com registros.

## Registrar

Tela de apontamento diário (`/registrar`), com navegação entre dias, busca e CRUD de registros.

## Relatório Semanal

Visão da semana segunda–domingo (`/semana`) com total por dia e por projeto.

## Relatório Mensal

Visão agregada das horas trabalhadas em um mês (`/relatorio`), com total por dia e por projeto.

## Tarefa (Task)

Item de lista de pendências, opcionalmente ligado a uma seção e a um projeto. Pode ter prioridade, data de vencimento e recorrência.

## Seção (Section)

Agrupador de tarefas, com nome, cor e ordem de exibição.

## Recorrência

Propriedade de uma tarefa (`daily`, `weekly`, `monthly`) que, ao ser concluída, gera automaticamente a próxima ocorrência ligada à original por `parent_id`.

## Prioridade

Nível de uma tarefa em 1–4 (1 = urgente, 4 = baixa). Ordenação padrão: urgente → baixa.

## Notificação

Aviso interno ao usuário, gerado a partir de tarefas vencidas ou que vencem no dia (ou mensagem de sistema).

## Admin

Usuário com `is_admin`, que acessa `/api/admin/*` e as telas de administração: visão geral, usuários, projetos e registros de todos os usuários.

## MVP (Minimum Viable Product)

Conjunto mínimo de funcionalidades da primeira versão:
- Cadastro de projetos
- Registro de horas
- Consulta diária
- Relatório mensal

## Mobile First

Abordagem de design que prioriza a experiência em dispositivos móveis antes da versão desktop.

## CRUD

Acrônimo para Create, Read, Update, Delete — operações básicas de manipulação de dados.
