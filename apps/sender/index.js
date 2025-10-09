const venom = require('venom-bot');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const senderAuthToken = process.env.SENDER_AUTH_TOKEN || process.env.AUTH_TOKEN || null;

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
let connectionStatus = 'initializing';
let lastMessageTime = Date.now();
let messageQueue = [];
let isProcessingQueue = false;
let lastQrCode = null;
let lastQrCodeTimestamp = null;
let lastQrCodeAttempts = 0;

// Configurações
const config = {
  rateLimitDelay: 2000, // 2 segundos entre mensagens
  maxRetries: 3,
  audioFormats: ['.mp3', '.ogg', '.wav', '.m4a'],
  maxAudioSize: 16 * 1024 * 1024 // 16MB
};

venom
  .create({
    session: 'versozap',
    multidevice: true,
    headless: true,
    disableSpins: true,
    logQR: false,
    catchQR: (base64Qr, asciiQR, attempts) => {
      lastQrCode = base64Qr;
      lastQrCodeAttempts = attempts;
      lastQrCodeTimestamp = new Date().toISOString();
      connectionStatus = 'qrcode';
      console.log('📸 Novo QR Code gerado (tentativa %d)', attempts);
    }
  })
  .then((cli) => {
    client = cli;
    connectionStatus = 'connected';
    lastQrCode = null;
    lastQrCodeAttempts = 0;
    lastQrCodeTimestamp = null;
    console.log('✅ Conectado ao WhatsApp!');

    // Processa fila de mensagens pendentes
    processMessageQueue();

    client.onMessage((message) => {
      if (message.isGroupMsg) return;
      if (!message.body.toLowerCase().startsWith('versozap')) return;
      
      console.log("Mensagem relevante recebida:", message.body);
      handleUserMessage(message);
    });

    // Monitor de estado da conexão
    client.onStateChange((state) => {
      console.log('Estado da conexão:', state);
      if (state === 'CONNECTED') {
        connectionStatus = 'connected';
        lastQrCode = null;
      } else if (state === 'OPENING' || state === 'PAIRING') {
        connectionStatus = 'connecting';
      } else {
        connectionStatus = 'disconnected';
      }
    });

    // Monitor de desconexão
    client.onStreamChange((state) => {
      console.log('Stream mudou:', state);
      if (state === 'DISCONNECTED') {
        connectionStatus = 'disconnected';
        console.log('⚠️ WhatsApp desconectado. Tentando reconectar...');
      }
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com o WhatsApp:', error);
    connectionStatus = 'error';
  });

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

app.get('/qrcode', (req, res) => {
  try {
    if (connectionStatus === 'connected') {
      return res.json({ 
        message: 'WhatsApp já está conectado',
        status: connectionStatus,
        connectedSince: new Date(Date.now() - process.uptime() * 1000).toISOString()
      });
    }

    if (!lastQrCode) {
      return res.status(202).json({
        message: 'QR Code ainda não disponível, tente novamente em instantes',
        status: connectionStatus
      });
    }

    return res.json({
      qrCode: lastQrCode,
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
    if (client) {
      await client.close();
    }
    
    // Reinicia a conexão
    connectionStatus = 'reconnecting';
    console.log('🔄 Tentando reconectar...');
    
    // Aqui você poderia reinicializar o venom-bot
    res.json({
      status: 'Reconexão iniciada',
      message: 'Tentando reconectar com o WhatsApp',
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
