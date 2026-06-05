# Containerization Guidelines

## Objetivo

Estas diretrizes definem os padrões que agentes de IA devem seguir ao criar, modificar ou revisar arquivos relacionados à containerização, incluindo:

* Dockerfile
* docker-compose.yml / compose.yaml
* .dockerignore
* Scripts de inicialização
* Configurações de containers
* Ambientes de desenvolvimento e produção

O objetivo principal é produzir configurações:

1. Seguras
2. Legíveis
3. Reproduzíveis
4. Performáticas
5. Fáceis de manter
6. Alinhadas às melhores práticas atuais do Docker

---

# Princípios Gerais

## Prioridade de Decisão

Sempre priorizar nesta ordem:

1. Segurança
2. Reprodutibilidade
3. Legibilidade
4. Performance
5. Conveniência

Nunca sacrificar segurança por conveniência.

---

# Regras para Dockerfile

## Utilizar imagens oficiais

Preferir imagens oficiais e amplamente utilizadas.

### Bom

```dockerfile
FROM node:22-alpine
```

```dockerfile
FROM python:3.13-slim
```

### Evitar

```dockerfile
FROM random-user/custom-node
```

---

## Fixar versões

Sempre utilizar versões explícitas.

### Bom

```dockerfile
FROM postgres:17.4
```

### Evitar

```dockerfile
FROM postgres:latest
```

O uso de `latest` compromete a reprodutibilidade.

---

## Utilizar imagens mínimas

Preferir:

* alpine
* slim
* distroless (quando aplicável)

Objetivos:

* Menor superfície de ataque
* Menor tamanho da imagem
* Menor tempo de download

---

## Utilizar Multi-stage Builds

Sempre considerar multi-stage builds para aplicações compiladas.

### Exemplo

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.28-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
```

Benefícios:

* Imagens menores
* Menos dependências em produção
* Melhor segurança

---

## Minimizar camadas

Agrupar comandos relacionados.

### Bom

```dockerfile
RUN apt-get update && \
    apt-get install -y curl wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

## Limpar caches

Remover arquivos temporários após instalação.

### Exemplo

```dockerfile
rm -rf /var/lib/apt/lists/*
```

```dockerfile
npm cache clean --force
```

Quando apropriado.

---

## Utilizar COPY em vez de ADD

Preferir:

```dockerfile
COPY . .
```

Evitar:

```dockerfile
ADD . .
```

Usar `ADD` apenas quando suas funcionalidades extras forem realmente necessárias.

---

## Executar como usuário não-root

Obrigatório sempre que possível.

### Exemplo

```dockerfile
RUN addgroup -S app && \
    adduser -S app -G app

USER app
```

Nunca executar aplicações como root sem justificativa explícita.

---

## Definir WORKDIR

Sempre definir diretório de trabalho.

### Exemplo

```dockerfile
WORKDIR /app
```

Evitar caminhos relativos.

---

## Utilizar ENTRYPOINT e CMD corretamente

### ENTRYPOINT

Para definir o executável principal.

### CMD

Para argumentos padrão.

### Exemplo

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

---

## Utilizar formato JSON

Preferir:

```dockerfile
CMD ["node", "server.js"]
```

Evitar:

```dockerfile
CMD node server.js
```

Benefícios:

* Melhor tratamento de sinais
* Encerramento adequado

---

## Expor apenas portas necessárias

### Exemplo

```dockerfile
EXPOSE 3000
```

Não expor portas não utilizadas.

---

## Healthcheck

Adicionar healthcheck sempre que possível.

### Exemplo

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s \
CMD wget --spider -q http://localhost:3000/health || exit 1
```

---

# Regras para .dockerignore

Todo projeto deve possuir `.dockerignore`.

## Exemplo mínimo

```text
.git
.github
node_modules
dist
build
coverage
.env
.env.*
*.log
Dockerfile*
docker-compose*
```

Objetivos:

* Builds mais rápidos
* Menos vazamento de dados
* Menor contexto de build

---

# Regras para Docker Compose

## Utilizar versão moderna

Preferir sintaxe compatível com Docker Compose V2.

Evitar dependência de versões antigas.

---

## Nomear serviços claramente

### Bom

```yaml
services:
  api:
  frontend:
  postgres:
```

### Evitar

```yaml
services:
  app1:
  app2:
```

---

## Utilizar variáveis de ambiente

Evitar valores hardcoded.

### Bom

```yaml
environment:
  DATABASE_URL: ${DATABASE_URL}
```

---

## Utilizar arquivos .env

Preferir:

```yaml
env_file:
  - .env
```

---

## Nunca armazenar segredos

Não incluir:

* Senhas
* Tokens
* Chaves privadas
* Credenciais

Diretamente no compose.

---

## Definir restart policy

### Produção

```yaml
restart: unless-stopped
```

ou

```yaml
restart: always
```

Conforme necessidade.

---

## Utilizar healthcheck

Sempre que possível.

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
```

---

## Utilizar depends_on com healthchecks

Não depender apenas da ordem de inicialização.

### Bom

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

---

## Utilizar redes explícitas

### Exemplo

```yaml
networks:
  backend:
```

Evitar depender exclusivamente da rede padrão.

---

## Utilizar volumes nomeados

Preferir:

```yaml
volumes:
  postgres_data:
```

Em vez de caminhos locais quando o objetivo for persistência.

---

## Definir limites de recursos

Quando aplicável.

### Exemplo

```yaml
deploy:
  resources:
    limits:
      cpus: "1"
      memory: 512M
```

---

# Segurança

## Nunca executar containers privilegiados

Evitar:

```yaml
privileged: true
```

---

## Utilizar sistema de arquivos somente leitura

Quando possível.

```yaml
read_only: true
```

---

## Remover capabilities desnecessárias

```yaml
cap_drop:
  - ALL
```

Adicionar apenas as necessárias.

---

## Utilizar imagens atualizadas

Dependências e imagens devem ser mantidas atualizadas regularmente.

---

## Escaneamento de vulnerabilidades

Recomendar uso de:

* Docker Scout
* Trivy
* Grype
* Snyk

Antes de publicar imagens.

---

# Performance

## Aproveitar cache de build

Copiar dependências antes do código.

### Exemplo Node.js

```dockerfile
COPY package*.json ./

RUN npm ci

COPY . .
```

---

## Utilizar npm ci

Preferir:

```dockerfile
RUN npm ci
```

Em vez de:

```dockerfile
RUN npm install
```

Em ambientes de CI/CD.

---

## Evitar dependências desnecessárias

Instalar apenas o necessário para execução.

---

# Produção

## Imagens imutáveis

A imagem deve ser promovida entre ambientes sem modificações.

---

## Logs em stdout/stderr

Não gravar logs locais por padrão.

### Bom

```javascript
console.log()
```

O runtime deve enviar logs para stdout/stderr.

---

## Configuração por ambiente

Utilizar variáveis de ambiente para:

* URLs
* Credenciais
* Feature flags
* Configurações específicas

Nunca recompilar imagens para trocar configurações.

---

# Checklist Final

Antes de finalizar qualquer Dockerfile ou Compose, verificar:

* [ ] Versões fixadas
* [ ] Sem uso de latest
* [ ] Usuário não-root
* [ ] Multi-stage build avaliado
* [ ] .dockerignore presente
* [ ] Healthcheck configurado
* [ ] Secrets fora do código
* [ ] Variáveis parametrizadas
* [ ] Cache de build otimizado
* [ ] Imagem mínima utilizada
* [ ] Volumes configurados corretamente
* [ ] Redes explícitas definidas
* [ ] Logs em stdout/stderr
* [ ] Arquivos legíveis e comentados quando necessário
* [ ] Segurança priorizada sobre conveniência

---

# Regra Fundamental

Ao gerar Dockerfiles ou Compose files, o agente deve sempre preferir:

* Clareza sobre complexidade
* Segurança sobre conveniência
* Reprodutibilidade sobre atalhos
* Manutenibilidade sobre otimizações prematuras

Toda decisão deve ser justificável sob os pilares de segurança, legibilidade e operação em produção.
