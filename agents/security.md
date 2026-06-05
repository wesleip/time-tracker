# SECURITY.md

# Security Guidelines

Este documento define as práticas obrigatórias de segurança para o projeto.

Todos os desenvolvedores e agentes de IA devem seguir estas regras durante implementação, revisão e manutenção do sistema.

Segurança não é uma etapa final.

Segurança deve ser considerada desde a primeira linha de código.

---

# Objetivos

Proteger:

* Dados dos usuários
* Dados dos projetos
* Registros de horas
* Sessões autenticadas
* APIs
* Banco de dados
* Infraestrutura

---

# Princípios Gerais

Sempre seguir:

* Least Privilege
* Defense in Depth
* Secure by Default
* Fail Securely
* Zero Trust

Nunca confiar em:

* Input do usuário
* Requests do navegador
* Dados enviados pelo frontend
* Cabeçalhos HTTP fornecidos pelo cliente

Toda entrada deve ser considerada não confiável.

---

# OWASP Top 10

## A01 - Broken Access Control

### Sempre

* Validar permissões no backend.
* Verificar autorização em todas as rotas protegidas.
* Aplicar princípio do menor privilégio.

### Nunca

* Confiar apenas no frontend.
* Ocultar botões como mecanismo de segurança.
* Expor recursos apenas porque o usuário conhece a URL.

---

## A02 - Cryptographic Failures

### Sempre

* Utilizar HTTPS.
* Utilizar bibliotecas modernas de criptografia.
* Armazenar segredos em variáveis de ambiente.
* Utilizar hashing seguro para senhas.

### Nunca

* Criar algoritmos próprios.
* Armazenar senhas em texto puro.
* Versionar segredos em Git.

---

## A03 - Injection

### Sempre

* Utilizar ORM.
* Utilizar queries parametrizadas.
* Validar entradas.

### Nunca

* Construir SQL manualmente.
* Concatenar strings em consultas.
* Executar comandos de sistema usando input do usuário.

Exemplo incorreto:

```python
query = f"SELECT * FROM users WHERE id = {user_id}"
```

Exemplo correto:

```python
User.query.filter(User.id == user_id)
```

---

## A04 - Insecure Design

### Sempre

* Definir requisitos de segurança antes da implementação.
* Revisar impactos de segurança em novas funcionalidades.

### Nunca

* Implementar funcionalidades sem considerar autenticação e autorização.

---

## A05 - Security Misconfiguration

### Sempre

* Utilizar configurações seguras por padrão.
* Remover endpoints de teste.
* Remover credenciais padrão.

### Nunca

* Habilitar debug em produção.
* Expor stack traces.
* Expor documentação interna publicamente.

---

## A06 - Vulnerable Components

### Sempre

* Manter dependências atualizadas.
* Utilizar versões estáveis.

### Ferramentas recomendadas

Frontend:

```bash
npm audit
```

Backend:

```bash
pip-audit
```

---

## A07 - Authentication Failures

### Sempre

* Utilizar autenticação forte.
* Expirar sessões.
* Invalidar tokens comprometidos.

### Nunca

* Armazenar senhas em texto puro.
* Compartilhar tokens entre usuários.

---

## A08 - Integrity Failures

### Sempre

* Validar dados recebidos.
* Revisar dependências externas.

### Nunca

* Executar código remoto sem validação.

---

## A09 - Logging Failures

### Sempre

Registrar:

* Login
* Logout
* Falhas de autenticação
* Alterações importantes

### Nunca registrar

* Senhas
* Tokens
* Segredos
* Dados sensíveis

---

## A10 - SSRF

### Sempre

Validar:

* URLs externas
* Hosts externos
* Recursos remotos

### Nunca

Permitir acesso arbitrário a:

* localhost
* metadata services
* redes internas

---

# Frontend Security

## Obrigatório

### Validação

Utilizar:

* Zod
* React Hook Form

Todo formulário deve validar:

* formato
* tamanho
* obrigatoriedade

---

## Sanitização

Nunca renderizar HTML fornecido pelo usuário.

Evitar:

```tsx
dangerouslySetInnerHTML
```

---

## Tokens

Nunca armazenar:

* senhas
* secrets
* api keys

No frontend.

---

## Erros

Nunca exibir:

* stack trace
* mensagens internas
* detalhes do backend

Mostrar mensagens amigáveis.

---

# Backend Security

## Obrigatório

### Pydantic

Todo request deve possuir schema.

Exemplo:

```python
class CreateProjectRequest(BaseModel):
    name: str
```

---

## Tratamento de Erros

Sempre retornar mensagens controladas.

Exemplo:

```python
HTTPException(
    status_code=404,
    detail="Project not found"
)
```

Nunca retornar:

```python
str(exception)
```

---

## Banco de Dados

Utilizar:

* SQLAlchemy
* Alembic

Evitar:

* SQL manual
* concatenação de consultas

---

# Secrets Management

## Obrigatório

Utilizar:

```env
DATABASE_URL=
JWT_SECRET=
```

Armazenar apenas em:

* Variáveis de ambiente
* Secret managers

---

## Proibido

```python
JWT_SECRET = "123456"
```

```javascript
const apiKey = "abcdef"
```

---

# Upload de Arquivos

Sempre validar:

* Tipo
* Tamanho
* Extensão

Nunca confiar:

* MIME enviado pelo navegador

---

# APIs

## Obrigatório

* Rate limiting
* Autenticação
* Validação
* Tratamento de erros

---

# Logs

Registrar:

* Data
* Usuário
* Operação
* Resultado

Não registrar:

* Senhas
* Tokens
* Secrets

---

# Code Review Checklist

Antes de aprovar qualquer alteração verificar:

* [ ] Inputs validados
* [ ] Permissões verificadas
* [ ] Sem segredos hardcoded
* [ ] Sem SQL Injection
* [ ] Sem XSS
* [ ] Sem exposição de informações sensíveis
* [ ] Logs adequados
* [ ] Tratamento de erros implementado
* [ ] Dependências seguras
* [ ] Documentação atualizada

---

# Definition of Secure Done

Uma funcionalidade só pode ser considerada concluída quando:

* Implementação concluída
* Testes executados
* Validações implementadas
* Tratamento de erros implementado
* Logs implementados
* Sem segredos expostos
* Sem vulnerabilidades conhecidas
* Revisão de segurança realizada

Segurança é um requisito obrigatório e não opcional.
