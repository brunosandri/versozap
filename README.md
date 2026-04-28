# Meu Projeto

Estrutura simples com um repositório e quatro apps.

```
versozap/
  apps/
    frontend/
    backend/
    admin/
    sender/
  .github/
    workflows/
      frontend.yml
  .gitignore
  README.md
```

## Como rodar

Cada app é independente.

```bash
cd apps/frontend && npm install && npm run dev
cd apps/backend  && npm install && npm run dev
cd apps/admin    && npm install && npm run dev
cd apps/sender   && npm install && npm run dev
```

## Próximos passos opcionais

- Adicionar `pnpm` e workspaces para instalar dependências na raiz.
- Adicionar Turborepo para build só do que mudou.
- Criar pacotes compartilhados em `packages/`.