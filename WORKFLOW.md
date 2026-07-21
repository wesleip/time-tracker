# Workflow

## Fluxo de Uso

1. Usuário acessa sistema
2. Seleciona projeto
3. Informa horas trabalhadas
4. Salva registro
5. Sistema atualiza totais

## Fluxo de Desenvolvimento

### Build Independente

Cada stack pode ser buildada separadamente:

```bash
# Build API only
make build-api

# Build frontend only
make build-frontend

# Build both
make build
```

### Deploy Independente

```bash
# Start API stack only (backend development)
make up-api

# Start frontend stack only (frontend development)
make up-frontend

# Start full stack
make up
```

### CI/CD Integration

```bash
# Build and push API
make push-api

# Build and push frontend
make push-frontend

# Build and push both
make push
```
