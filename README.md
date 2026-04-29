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
cd apps/backend  && pip install -r requirements.txt && python app.py
cd apps/admin    && npm install && npm run dev
cd apps/sender   && npm ci && npm run dev
```

Para o envio por WhatsApp, mantenha o `apps/sender` rodando como processo persistente no Railway e configure o backend com `SENDER_URL` apontando para a URL pública do serviço sender, por exemplo `https://sender-production-40b5.up.railway.app`.

## Próximos passos opcionais

- Adicionar `pnpm` e workspaces para instalar dependências na raiz.
- Adicionar Turborepo para build só do que mudou.
- Criar pacotes compartilhados em `packages/`.
