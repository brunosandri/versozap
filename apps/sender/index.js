const venom = require('venom-bot');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const senderAuthToken = process.env.SENDER_AUTH_TOKEN || process.env.AUTH_TOKEN || null;

const sessionStorageDir = (() => {
  if (process.env.SENDER_SESSION_DIR) {
    return path.resolve(process.env.SENDER_SESSION_DIR);
  }

  if (process.env.VERCEL) {
    return path.join('/tmp', 'versozap-sessions');
  }

  return path.join(__dirname, '.sessions');
})();

try {
  fs.mkdirSync(sessionStorageDir, { recursive: true });
  console.log(`📁 Diretório de sessão: ${sessionStorageDir}`);
} catch (error) {
  console.warn('⚠️ Não foi possível preparar o diretório de sessão do WhatsApp:', error.message);
}

function extractAuthToken(req) {
  const headerToken = req.headers['x-api-key'];
  const authorization = req.headers['authorization'];

  if (typeof headerToken === 'string' && headerToken.trim().length > 0) {
    return headerToken.trim();
  }

  if (typeof authorization === 'string') {
    const trimmed = authorization.trim();
    if (trimmed.toLowerCase().startsWith('bearer ')) {
      return trimmed.slice(7);
    }
    return trimmed;
  }

  return null;
}

function requireAuth(req, res, next) {
  if (!senderAuthToken) {
    return next();
  }

  const providedToken = extractAuthToken(req);

  if (!providedToken || providedToken !== senderAuthToken) {
    return res.status(401).json({
      erro: 'Credenciais inválidas para o serviço Sender',
      timestamp: new Date().toISOString(),
    });
  }

  return next();
}

let client = null;
let connectionStatus = 'idle';
let lastMessageTime = Date.now();
let messageQueue = [];
let isProcessingQueue = false;
let lastQrCode = null;
let lastQrCodeDataUri = null;
let lastQrCodeAscii = null;
let lastQrCodeTimestamp = null;
let lastQrCodeAttempts = 0;
let venomInitPromise = null;
const qrCodeWaiters = new Set();

function normalizeQrCodePayload(base64Qr) {
  if (typeof base64Qr !== 'string') {
    return { base64: null, dataUri: null };
  }

  const trimmed = base64Qr.trim();
  if (!trimmed) {
    return { base64: null, dataUri: null };
  }

  if (trimmed.startsWith('data:')) {
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex !== -1) {
      return {
        base64: trimmed.slice(commaIndex + 1),
        dataUri: trimmed,
      };
    }

    return { base64: null, dataUri: trimmed };
  }

  return {
    base64: trimmed,
    dataUri: `data:image/png;base64,${trimmed}`,
  };
}

const venomConfig = {
  session: process.env.SENDER_SESSION_NAME || 'versozap',
  multidevice: true,
  headless: true,
  disableSpins: true,
  logQR: false,
  updatesLog: false,
  autoClose: 0,
  catchQR: (base64Qr, asciiQR, attempts) => {
    const { base64, dataUri } = normalizeQrCodePayload(base64Qr);
    lastQrCode = base64;
    lastQrCodeDataUri = dataUri;
    lastQrCodeAscii = asciiQR || null;
    lastQrCodeAttempts = attempts;
    lastQrCodeTimestamp = new Date().toISOString();
    connectionStatus = 'qrcode';
    console.log('📸 Novo QR Code gerado (tentativa %d)', attempts);
    if (process.env.VERCEL) {
      console.log('🔄 Ambiente Vercel detectado — mantenha esta função aberta enquanto escaneia o QR Code.');
    }
    notifyQrCodeWaiters();
  },
  folderNameToken: process.env.SENDER_TOKEN_FOLDER || 'versozap-tokens',
  mkdirFolderToken: sessionStorageDir,
  addBrowserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--disable-background-networking',
  ],
};

// Configurações
const config = {
  rateLimitDelay: 2000, // 2 segundos entre mensagens
  maxRetries: 3,
  audioFormats: ['.mp3', '.ogg', '.wav', '.m4a'],
  maxAudioSize: 16 * 1024 * 1024 // 16MB
};

async function startVenomClient({ force = false } = {}) {
  if (client && !force) {
    return client;
  }

if (force && client) {
    try {
      await client.close();
    } catch (error) {
      console.warn('⚠️ Erro ao encerrar cliente anterior:', error.message);
    }
    client = null;
  }

  if (venomInitPromise && !force) {
    return venomInitPromise;
  }

  if (venomInitPromise && force) {
    try {
      await venomInitPromise;
    } catch (error) {
      console.warn('⚠️ Inicialização anterior do Venom falhou:', error.message);
    }
  }

  connectionStatus = 'initializing';

  venomInitPromise = venom
    .create(venomConfig)
    .then((cli) => {
      client = cli;
      connectionStatus = 'connecting';
      clearCachedQrCode();
      setupClientEventHandlers();
      processMessageQueue();
      return client;
    })
    .catch((error) => {
      console.error('❌ Erro ao conectar com o WhatsApp:', error);
      connectionStatus = 'error';
      notifyQrCodeWaiters();
      throw error;
    })
    .finally(() => {
      venomInitPromise = null;
    });
  
    return venomInitPromise;
}

function clearCachedQrCode() {
  lastQrCode = null;
  lastQrCodeDataUri = null;
  lastQrCodeAscii = null;
  lastQrCodeAttempts = 0;
  lastQrCodeTimestamp = null;
}

function setupClientEventHandlers() {
  if (!client) {
    return;
  }

  client.onMessage((message) => {
    if (message.isGroupMsg) return;
    if (!message.body.toLowerCase().startsWith('versozap')) return;

    console.log('Mensagem relevante recebida:', message.body);
    handleUserMessage(message);
  });

  client.onStateChange((state) => {
    console.log('Estado da conexão:', state);
    if (state === 'CONNECTED') {
      connectionStatus = 'connected';
      clearCachedQrCode();
      notifyQrCodeWaiters();
    } else if (state === 'OPENING' || state === 'PAIRING') {
      connectionStatus = 'connecting';
    } else if (state === 'UNPAIRED' || state === 'UNPAIRED_IDLE') {
      connectionStatus = 'qrcode';
    } else {
      connectionStatus = 'disconnected';
    }
  });

  client.onStreamChange((state) => {
    console.log('Stream mudou:', state);
    if (state === 'DISCONNECTED') {
      connectionStatus = 'disconnected';
      console.log('⚠️ WhatsApp desconectado. Tentando reconectar...');
      startVenomClient({ force: true }).catch((error) => {
        console.error('❌ Falha ao reiniciar cliente após desconexão:', error.message);
      });
    }
  });

  if (typeof client.onLogout === 'function') {
    client.onLogout(() => {
      console.log('🚪 Logout detectado. Preparando novo QR Code...');
      connectionStatus = 'disconnected';
      startVenomClient({ force: true }).catch((error) => {
        console.error('❌ Falha ao reiniciar cliente após logout:', error.message);
    });
  });
  }
}

function notifyQrCodeWaiters() {
  const waiters = Array.from(qrCodeWaiters);
  qrCodeWaiters.clear();
  waiters.forEach((notify) => {
    try {
      notify();
    } catch (error) {
      console.warn('⚠️ Erro ao notificar aguardando de QR Code:', error.message);
    }
  });
}

async function waitForQrCode(timeoutMs = 15000) {
  if (lastQrCode || lastQrCodeAscii) {
    return true;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      qrCodeWaiters.delete(listener);
      resolve(false);
    }, timeoutMs);

    function listener() {
      clearTimeout(timeout);
      qrCodeWaiters.delete(listener);
      resolve(!!(lastQrCode || lastQrCodeAscii));
    }

    qrCodeWaiters.add(listener);
  });
}

// Funções auxiliares
async function processMessageQueue() {
  if (isProcessingQueue || messageQueue.length === 0) return;
  
  isProcessingQueue = true;
  console.log(`📤 Processando fila: ${messageQueue.length} mensagens`);
  
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    
    try {
      await sendMessageWithRateLimit(message);
      console.log(`✅ Mensagem enviada: ${message.telefone}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem: ${error.message}`);
      
      // Recoloca na fila se ainda há tentativas
      if (message.retries < config.maxRetries) {
        message.retries++;
        messageQueue.unshift(message);
        await delay(5000); // Espera 5s antes de tentar novamente
      }
    }
  }
  
  isProcessingQueue = false;
}

async function sendMessageWithRateLimit(messageData) {
  // Rate limiting
  const timeSinceLastMessage = Date.now() - lastMessageTime;
  if (timeSinceLastMessage < config.rateLimitDelay) {
    await delay(config.rateLimitDelay - timeSinceLastMessage);
  }
  
  const { telefone, mensagem, audio } = messageData;
  const chatId = `${telefone}@c.us`;

  if (!client) {
    throw new Error('Cliente WhatsApp indisponível para envio');
  }
  
  // Envia mensagem de texto
  if (mensagem) {
    await client.sendText(chatId, mensagem);
  }
  
  // Envia áudio se disponível
  if (audio && fs.existsSync(audio)) {
    await sendAudioMessage(chatId, audio);
  }
  
  lastMessageTime = Date.now();
}

async function sendAudioMessage(chatId, audioPath) {
  try {
    if (!client) {
      throw new Error('Cliente WhatsApp indisponível para envio de áudio');
    }

    // Verifica se o arquivo existe e tem tamanho válido
    const stats = fs.statSync(audioPath);
    if (stats.size > config.maxAudioSize) {
      throw new Error(`Arquivo de áudio muito grande: ${stats.size} bytes`);
    }
    
    // Verifica extensão do arquivo
    const ext = path.extname(audioPath).toLowerCase();
    if (!config.audioFormats.includes(ext)) {
      throw new Error(`Formato de áudio não suportado: ${ext}`);
    }
    
    // Envia como áudio (PTT - Push to Talk)
    await client.sendPtt(chatId, audioPath);
    console.log(`🎵 Áudio enviado: ${audioPath}`);
    
  } catch (error) {
    console.error(`❌ Erro ao enviar áudio: ${error.message}`);
    // Não falha a mensagem inteira por causa do áudio
  }
}

async function handleUserMessage(message) {
  const command = message.body.toLowerCase().replace('versozap', '').trim();
  
  switch (command) {
    case 'status':
      await client.sendText(
        message.from,
        '✅ VersoZap funcionando normalmente!\n📱 Status: Conectado\n🕐 Horário: ' + new Date().toLocaleTimeString('pt-BR')
      );
      break;
      
    case 'parar':
      await client.sendText(
        message.from,
        '⏸️ Para parar de receber mensagens, entre em contato com o suporte.'
      );
      break;
      
    case 'ajuda':
      await client.sendText(
        message.from,
        '📖 *VersoZap - Comandos disponíveis:*\n\n' +
        '• versozap status - Verificar status\n' +
        '• versozap parar - Parar mensagens\n' +
        '• versozap ajuda - Esta mensagem\n\n' +
        'Para configurar seu plano de leitura, acesse: app.versozap.com.br'
      );
      break;
      
    default:
      await client.sendText(
        message.from,
        '🙏 Olá! Sou o VersoZap.\n\n' +
        'Digite "versozap ajuda" para ver os comandos disponíveis.\n\n' +
        'Acesse app.versozap.com.br para configurar suas preferências.'
      );
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatPhoneNumber(phone) {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Adiciona código do país se necessário
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return `55${cleaned}`;
  } else if (cleaned.length === 10) {
    return `5511${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned;
  }
  
  return cleaned;
}

// Rotas da API
app.get('/', (req, res) => {
  res.json({
    service: 'VersoZap Sender',
    status: connectionStatus,
    version: '2.0.0',
    uptime: process.uptime(),
    queueSize: messageQueue.length,
    hasQrCode: !!lastQrCode,
    timestamp: new Date().toISOString()
  });
});

app.post('/enviar', requireAuth, async (req, res) => {
  const { telefone, mensagem, audio } = req.body;

  if (!telefone || !mensagem) {
    return res.status(400).json({ 
      erro: 'Telefone e mensagem são obrigatórios',
      received: { telefone: !!telefone, mensagem: !!mensagem, audio: !!audio }
    });
  }

  if (connectionStatus !== 'connected') {
    return res.status(503).json({ 
      erro: 'WhatsApp não conectado', 
      status: connectionStatus 
    });
  }

  try {
    const formattedPhone = formatPhoneNumber(telefone);
    
    const messageData = {
      telefone: formattedPhone,
      mensagem,
      audio,
      retries: 0,
      timestamp: Date.now()
    };

    // Se estamos conectados, tenta enviar imediatamente
    if (!isProcessingQueue) {
      try {
        await sendMessageWithRateLimit(messageData);
        console.log(`✅ Mensagem enviada imediatamente: ${formattedPhone}`);
        
        return res.json({ 
          status: 'Mensagem enviada com sucesso',
          telefone: formattedPhone,
          timestamp: new Date().toISOString(),
          hasAudio: !!audio
        });
      } catch (error) {
        console.log(`⚠️ Erro no envio imediato, adicionando à fila: ${error.message}`);
        // Se falha, adiciona à fila
        messageQueue.push(messageData);
        processMessageQueue(); // Tenta processar a fila
      }
    } else {
      // Adiciona à fila se já estamos processando
      messageQueue.push(messageData);
    }
    
    return res.json({ 
      status: 'Mensagem adicionada à fila',
      telefone: formattedPhone,
      queuePosition: messageQueue.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Erro ao processar mensagem: ${error.message}`);
    return res.status(500).json({ 
      erro: 'Erro interno ao processar mensagem', 
      detalhes: error.message 
    });
  }
});

// Nova rota para envio de áudio específico
app.post('/enviar-audio', requireAuth, async (req, res) => {
  const { telefone, audioPath, mensagem } = req.body;

  if (!telefone || !audioPath) {
    return res.status(400).json({ 
      erro: 'Telefone e caminho do áudio são obrigatórios' 
    });
  }

  if (connectionStatus !== 'connected') {
    return res.status(503).json({ 
      erro: 'WhatsApp não conectado', 
      status: connectionStatus 
    });
  }

  try {
    const formattedPhone = formatPhoneNumber(telefone);
    const chatId = `${formattedPhone}@c.us`;
    
    // Envia mensagem de texto primeiro (se fornecida)
    if (mensagem) {
      await client.sendText(chatId, mensagem);
    }
    
    // Envia áudio
    await sendAudioMessage(chatId, audioPath);
    
    return res.json({ 
      status: 'Áudio enviado com sucesso',
      telefone: formattedPhone,
      audioPath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Erro ao enviar áudio: ${error.message}`);
    return res.status(500).json({ 
      erro: 'Erro ao enviar áudio', 
      detalhes: error.message 
    });
  }
});

// Rota para verificar status da fila
app.get('/status', (req, res) => {
  res.json({
    whatsappStatus: connectionStatus,
    queueSize: messageQueue.length,
    isProcessingQueue,
    uptime: process.uptime(),
    lastMessageTime: new Date(lastMessageTime).toISOString(),
    config: {
      rateLimitDelay: config.rateLimitDelay,
      maxRetries: config.maxRetries,
      supportedAudioFormats: config.audioFormats
    },
    timestamp: new Date().toISOString()
  });
});

// Rota para limpar a fila (apenas para admin)
app.post('/clear-queue', requireAuth, (req, res) => {
  const clearedCount = messageQueue.length;
  messageQueue = [];
  
  res.json({
    status: 'Fila limpa',
    messagesCleared: clearedCount,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000;

startVenomClient().catch((error) => {
  console.error('❌ Falha inicial ao conectar com o WhatsApp:', error.message);
});

app.get('/qrcode', async (req, res) => {
  try {
    if (connectionStatus === 'connected') {
      return res.json({
        message: 'WhatsApp já está conectado',
        status: connectionStatus,
        connectedSince: new Date(Date.now() - process.uptime() * 1000).toISOString()
      });
    }

    startVenomClient().catch((error) => {
      console.error('❌ Falha ao inicializar cliente ao solicitar QR Code:', error.message);
    });

    if (!lastQrCode && !lastQrCodeAscii) {
      const hasQrCode = await waitForQrCode(10000);

      if (!hasQrCode) {
        return res.status(202).json({
          message: 'QR Code ainda não disponível, tente novamente em instantes',
          status: connectionStatus
        });
      }
    }

    if (!lastQrCode && !lastQrCodeAscii) {
      return res.status(202).json({
        message: 'QR Code ainda não disponível, tente novamente em instantes',
        status: connectionStatus
      });
    }

    return res.json({
      qrCode: lastQrCode,
      qrCodeDataUri: lastQrCodeDataUri,
      asciiQr: lastQrCodeAscii,
      status: connectionStatus,
      attempts: lastQrCodeAttempts,
      generatedAt: lastQrCodeTimestamp,
      message: 'Escaneie o QR Code com seu WhatsApp'
    });
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    return res.status(500).json({
      erro: 'Erro interno ao gerar QR Code',
      detalhes: error.message
    });
  }
});

// Rota para reconectar manualmente
app.post('/reconnect', requireAuth, async (req, res) => {
  try {
    connectionStatus = 'reconnecting';
    console.log('🔄 Tentando reconectar...');

    const initialization = startVenomClient({ force: true });
    initialization.catch((error) => {
      console.error('❌ Falha ao reinicializar o Venom após solicitação manual:', error.message);
    });
    
    res.json({
      status: 'Reconexão iniciada',
      message: 'Um novo QR Code será gerado em instantes.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao reconectar:', error);
    res.status(500).json({
      erro: 'Erro ao tentar reconectar',
      detalhes: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: connectionStatus === 'connected' ? 'healthy' : 'unhealthy',
    whatsapp: connectionStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    erro: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT. Encerrando graciosamente...');
  
  if (client) {
    try {
      await client.close();
      console.log('✅ Cliente WhatsApp desconectado');
    } catch (error) {
      console.error('❌ Erro ao desconectar cliente:', error);
    }
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM. Encerrando graciosamente...');
  
  if (client) {
    try {
      await client.close();
      console.log('✅ Cliente WhatsApp desconectado');
    } catch (error) {
      console.error('❌ Erro ao desconectar cliente:', error);
    }
  }
  
  process.exit(0);
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 VersoZap Sender v2.0.0 rodando em http://localhost:${port}`);
    console.log(`📱 Status inicial: ${connectionStatus}`);
    console.log(`⚙️ Rate limit: ${config.rateLimitDelay}ms entre mensagens`);
    console.log(`🎵 Formatos de áudio suportados: ${config.audioFormats.join(', ')}`);
  });
}

module.exports = app;
