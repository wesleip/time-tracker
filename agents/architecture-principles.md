# ARCHITECTURE-PRINCIPLES.md

# Architecture Principles

Este documento define os princípios arquiteturais obrigatórios para o projeto.

Todos os desenvolvedores e agentes de IA devem seguir estas diretrizes durante implementação, manutenção e evolução do sistema.

---

# Objetivos

A arquitetura deve priorizar:

* Simplicidade
* Clareza
* Evolução contínua
* Testabilidade
* Segurança
* Baixo acoplamento

Evitar soluções complexas para problemas simples.

---

# Princípios Fundamentais

## KISS

Keep It Simple, Stupid

Sempre escolher a solução mais simples que resolva o problema.

### Preferir

* Funções simples
* Componentes pequenos
* Estruturas diretas

### Evitar

* Abstrações prematuras
* Design patterns desnecessários
* Frameworks adicionais sem necessidade

Pergunta obrigatória:

> Existe uma solução mais simples?

---

## YAGNI

You Aren't Gonna Need It

Implementar apenas o que é necessário hoje.

### Fazer

* Implementar requisitos atuais

### Não fazer

* Funcionalidades futuras
* Hooks genéricos sem uso
* APIs genéricas sem necessidade

Pergunta obrigatória:

> Esse código resolve um requisito existente?

---

## DRY

Don't Repeat Yourself

Evitar duplicação de lógica.

### Fazer

* Reutilizar componentes
* Reutilizar funções
* Centralizar regras de negócio

### Evitar

* Copiar e colar código
* Duplicar validações
* Duplicar regras

Importante:

Não criar abstrações complexas apenas para seguir DRY.

KISS tem prioridade sobre DRY.

---

# SOLID

Aplicar SOLID de forma pragmática.

Não transformar o projeto em um exercício acadêmico.

---

## S - Single Responsibility Principle

Cada módulo deve possuir uma responsabilidade principal.

### Bom

```text
ProjectService
ProjectRepository
ProjectForm
```

### Ruim

```text
ProjectManager
```

fazendo:

* CRUD
* validação
* autenticação
* relatórios

---

## O - Open Closed Principle

Permitir extensão sem modificar comportamento existente.

Utilizar composição antes de herança.

---

## L - Liskov Substitution Principle

Subtipos devem funcionar como seus tipos base.

Evitar heranças complexas.

---

## I - Interface Segregation Principle

Interfaces pequenas e específicas.

Evitar:

```typescript
interface EverythingService {}
```

Preferir:

```typescript
interface ProjectRepository {}
interface ReportRepository {}
```

---

## D - Dependency Inversion Principle

Depender de abstrações quando houver benefício real.

Não criar interfaces apenas por criar.

---

# Clean Architecture

Utilizar conceitos simplificados.

---

## Camadas

### Domain

Contém:

* Entidades
* Regras de negócio

Exemplos:

```text
Project
TimeEntry
User
```

---

### Application

Contém:

* Casos de uso
* Serviços

Exemplos:

```text
CreateProject
RegisterTime
GenerateReport
```

---

### Infrastructure

Contém:

* Banco de dados
* APIs externas
* Arquivos

---

### Presentation

Contém:

Frontend:

* Pages
* Components
* Forms
* Layouts

Backend:

* Controllers
* Routers
* Schemas

---

# Frontend Principles

---

## Component First

Criar componentes reutilizáveis.

Preferir:

```text
ProjectCard
TimeEntryForm
StatsCard
```

Evitar:

```text
MegaDashboardComponent
```

com milhares de linhas.

---

## Component Size

Meta:

* até 200 linhas

Ideal:

* 50 a 150 linhas

Refatorar quando crescer demais.

---

## Hooks

Criar hooks apenas quando houver reutilização real.

Evitar:

```typescript
useProjectButton()
```

sem necessidade.

---

## State Management

Preferir:

* React State
* Context API

Somente introduzir soluções mais complexas quando necessário.

---

# Backend Principles

---

## Services

Toda regra de negócio deve estar em services.

Evitar colocar lógica em:

* Controllers
* Routers
* Endpoints

---

## Repositories

Responsáveis apenas por acesso a dados.

Não devem conter regra de negócio.

---

## Schemas

Responsáveis apenas por:

* validação
* serialização

---

# Estrutura Recomendada

Frontend

```text
src/

app/
components/
features/
hooks/
layouts/
pages/
routes/
services/
types/
utils/
```

Backend

```text
backend/

app/

api/
core/
models/
schemas/
services/
repositories/
database/
tests/
```

---

# Naming Convention

Utilizar nomes explícitos.

Bom:

```text
CreateProjectService
TimeEntryRepository
ProjectListPage
```

Ruim:

```text
Manager
Helper
Utils
Common
Base
Generic
```

---

# Error Handling

Toda falha deve ser tratada.

Nunca:

```python
except:
    pass
```

Sempre:

```python
except Exception as exc:
    logger.error(...)
```

---

# Logging

Registrar:

* Login
* Logout
* Criação
* Alteração
* Exclusão

Nunca registrar:

* Senhas
* Tokens
* Secrets

---

# Performance

Otimizar somente quando existir evidência.

Evitar:

* Caches prematuros
* Micro otimizações
* Complexidade sem benefício

---

# Testability

Toda regra de negócio deve ser testável.

Separar:

* UI
* Infraestrutura
* Negócio

---

# AI Agent Rules

Antes de implementar qualquer funcionalidade:

1. Ler documentação.
2. Verificar requisitos.
3. Verificar impacto arquitetural.
4. Criar plano.
5. Implementar.

Antes de criar qualquer abstração:

Perguntar:

* Resolve um problema atual?
* Reduz complexidade?
* Será reutilizada?

Se qualquer resposta for "não", não implementar.

---

# Golden Rule

A solução mais simples que resolve o problema corretamente é a solução preferida.

Sempre priorizar:

Clareza > Inteligência

Legibilidade > Complexidade

Manutenção > Sofisticação
