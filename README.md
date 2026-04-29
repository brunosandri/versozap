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

Para rodar os testes do backend:

```bash
cd apps/backend
pip install -r requirements-dev.txt
python -m pytest -q -p no:cacheprovider test_auth_system.py test_bible_system.py
```

Para o envio por WhatsApp, mantenha o `apps/sender` rodando como processo persistente no Railway e configure o backend com `SENDER_URL` apontando para a URL pública do serviço sender, por exemplo `https://sender-production-40b5.up.railway.app`.

## Deploy frontend

O frontend está configurado para deploy estático via Netlify usando `netlify.toml`.
Configure `VITE_API_URL` no ambiente do deploy com a URL pública do backend: `https://versozap-production.up.railway.app`.
Para usar `app.versozap.com.br`, aponte o DNS do subdomínio para o host fornecido pelo Netlify.

## Próximos passos opcionais

- Adicionar `pnpm` e workspaces para instalar dependências na raiz.
- Adicionar Turborepo para build só do que mudou.
- Criar pacotes compartilhados em `packages/`.
