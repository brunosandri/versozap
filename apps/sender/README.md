# VersoZap Sender

Este serviço Node.js é responsável por enviar mensagens e áudios via WhatsApp. Para hospedá-lo na Vercel (ou em qualquer outra plataforma), utilize variáveis de ambiente para controlar as credenciais de acesso.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `SENDER_AUTH_TOKEN` | Opcional (recomendada) | Token compartilhado utilizado para autenticar as requisições que chegam ao serviço. Configure o mesmo valor no backend (`apps/backend`) para que ele envie as requisições com o cabeçalho apropriado. |
| `PORT` | Opcional | Porta utilizada pelo servidor Express. A Vercel define automaticamente este valor durante o deploy. |
| `SENDER_SESSION_DIR` | Opcional | Diretório onde o Venom irá salvar os arquivos de sessão. Em produção (Vercel) o serviço utiliza `/tmp/versozap-sessions` automaticamente. |
| `SENDER_SESSION_NAME` | Opcional | Nome da sessão utilizada pelo Venom. Útil para separar múltiplas instâncias. |
| `SENDER_TOKEN_FOLDER` | Opcional | Nome da pasta de tokens criada pelo Venom (padrão `versozap-tokens`). |

> Caso `SENDER_AUTH_TOKEN` esteja definida, todas as rotas `POST` sensíveis (`/enviar`, `/enviar-audio`, `/clear-queue`, `/reconnect`) exigirão que o token seja enviado no cabeçalho `Authorization` (formato `Bearer <token>`) ou no cabeçalho `x-api-key`.

## Deploy na Vercel

1. Faça o push deste repositório para a Vercel.
2. Crie uma variável de ambiente `SENDER_AUTH_TOKEN` nas configurações do projeto (Production, Preview e Development, se necessário).
3. Garanta que o backend (`apps/backend`) também possua a variável `SENDER_AUTH_TOKEN` com o mesmo valor, permitindo que as requisições sejam autenticadas automaticamente.

Com isso, o serviço ficará protegido e pronto para ser utilizado pela aplicação principal.