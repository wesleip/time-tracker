# Projeto

## Problema

Profissionais trabalham em vários projetos simultaneamente e precisam registrar horas gastas em cada atividade.

## Público-alvo

- SRE
- DevOps
- Desenvolvedores
- Consultores
- Analistas

## Objetivo

Registrar horas trabalhadas de forma simples e rápida.

## MVP

- Cadastro de projetos
- Registro de horas
- Consulta diária
- Relatório mensal

## Escopo atual

Além do MVP, a aplicação hoje tem:

- Autenticação multi-usuário com JWT e dados isolados por usuário
- Dashboard com totais de hoje, semana e mês
- Relatório semanal (segunda–domingo)
- Tarefas com seções, prioridade, vencimento e recorrência
- Notificações de tarefas vencidas / do dia
- Painel administrativo (usuários, projetos e registros globais)
- Deploy em containers com Caddy (HTTPS) e imagens multi-arch

Detalhes de funcionalidades e endpoints no `README.md`; regras do módulo de tarefas em `REQUIREMENTS.md`.
