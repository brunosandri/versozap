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

## Pré-requisitos para o QR Code do WhatsApp

O endpoint `/qrcode` exposto neste serviço apenas retorna um código válido depois que o Venom inicializa completamente e dispara o callback `catchQR`. É ele quem salva o último QR code gerado em memória (`lastQrCode`) para que o frontend possa exibi-lo ao usuário. **Se o processo for interrompido antes disso, o QR code nunca fica disponível e a tela de conexão continua em “Carregando QR Code…”.**

Por esse motivo, o VersoZap Sender precisa rodar em um ambiente com **processo Node.js persistente** (Railway, Render, servidor próprio etc.). Plataformas _serverless_ como a Vercel executam o arquivo `index.js` a cada requisição e encerram a função logo em seguida; nesse modelo o Venom não tem tempo de abrir o navegador headless, gerar o QR e atualizar as variáveis `lastQrCode`/`connectionStatus` que abastecem a rota `/qrcode`.

Antes de testar o fluxo de conexão do usuário, garanta que:

1. O serviço está rodando de forma contínua (`npm start` ou container em execução) e com acesso à biblioteca Chromium usada pelo Venom (ver opções `addBrowserArgs` em `index.js`).
2. As credenciais opcionais (`SENDER_AUTH_TOKEN`, diretórios de sessão, nome da sessão) estão configuradas de acordo com o ambiente.
3. O backend que consulta `/qrcode` está apontando para essa instância persistente do Sender.

Somente assim o gerador de QR code conseguirá entregar o código para o usuário escanear e vincular o WhatsApp corretamente.

## Formato do endpoint `/qrcode`

Quando disponível, a resposta inclui tanto a imagem pronta para ser exibida quanto uma versão em texto do QR Code que pode ser
utilizada como fallback em interfaces que não suportam imagens.

Ao receber uma requisição `GET /qrcode`, o serviço garante que o Venom está inicializado (ou reinicia o cliente, se necessário)
e aguarda por até 10 segundos para que o evento `catchQR` seja disparado. Assim que o QR Code chega pelo Venom, ele é salvo na
memória do processo e retornado imediatamente na resposta.

| Campo | Descrição |
| --- | --- |
| `qrCode` | String base64 (sem prefixo `data:image/png;base64,`) para gerar a imagem do QR Code. |
| `qrCodeDataUri` | String no formato `data:image/png;base64,...`, pronta para ser usada diretamente no atributo `src` de uma tag `<img>`. |
| `asciiQr` | Representação em texto do QR Code (mesmo conteúdo exibido no terminal pelo Venom). |
| `generatedAt` | Timestamp ISO da geração do código. |
| `attempts` | Quantidade de tentativas feitas pelo Venom para gerar o código. |
| `status` | Estado atual da conexão com o WhatsApp. |

Caso o Venom ainda não tenha disparado o `catchQR`, o endpoint retornará `202 Accepted` com uma mensagem informando que o QR Code
está sendo preparado.

## Pré-requisitos para o QR Code do WhatsApp

O endpoint `/qrcode` exposto neste serviço apenas retorna um código válido depois que o Venom inicializa completamente e dispara o callback `catchQR`. É ele quem salva o último QR code gerado em memória (`lastQrCode`) para que o frontend possa exibi-lo ao usuário. **Se o processo for interrompido antes disso, o QR code nunca fica disponível e a tela de conexão continua em “Carregando QR Code…”.**

Por esse motivo, o VersoZap Sender precisa rodar em um ambiente com **processo Node.js persistente** (Railway, Render, servidor próprio etc.). Plataformas _serverless_ como a Vercel executam o arquivo `index.js` a cada requisição e encerram a função logo em seguida; nesse modelo o Venom não tem tempo de abrir o navegador headless, gerar o QR e atualizar as variáveis `lastQrCode`/`connectionStatus` que abastecem a rota `/qrcode`.

Antes de testar o fluxo de conexão do usuário, garanta que:

1. O serviço está rodando de forma contínua (`npm start` ou container em execução) e com acesso à biblioteca Chromium usada pelo Venom (ver opções `addBrowserArgs` em `index.js`).
2. As credenciais opcionais (`SENDER_AUTH_TOKEN`, diretórios de sessão, nome da sessão) estão configuradas de acordo com o ambiente.
3. O backend que consulta `/qrcode` está apontando para essa instância persistente do Sender.

Somente assim o gerador de QR code conseguirá entregar o código para o usuário escanear e vincular o WhatsApp corretamente.