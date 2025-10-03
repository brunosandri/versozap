import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConfigurarWhatsapp() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const senderUrl = import.meta.env.VITE_SENDER_URL || 'https://versozap-sender-v2-production.up.railway.app';
      const response = await fetch(`${senderUrl}/status`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setConnectionStatus(data.whatsappStatus);

      if (data.whatsappStatus === 'connected') {
        // Já está conectado, redireciona para dashboard
        navigate('/dashboard');
      } else {
        // Precisa conectar, busca QR code
        fetchQrCode();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setError(`Erro ao verificar conexão do WhatsApp: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      const senderUrl = import.meta.env.VITE_SENDER_URL || 'https://versozap-sender-v2-production.up.railway.app';
      const response = await fetch(`${senderUrl}/qrcode`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        // Inicia polling para verificar conexão
        startConnectionPolling();
      } else if (data.message) {
        setError(data.message);
      } else if (data.erro) {
        setError(data.erro);
      } else {
        setError('QR Code não disponível');
      }
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
      setError('Erro ao carregar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const startConnectionPolling = () => {
    const interval = setInterval(async () => {
      try {
        const senderUrl = import.meta.env.VITE_SENDER_URL || 'https://versozap-sender-v2-production.up.railway.app';
        const response = await fetch(`${senderUrl}/status`);

        if (response.ok) {
          const data = await response.json();

          if (data.whatsappStatus === 'connected') {
            clearInterval(interval);
            setConnectionStatus('connected');

            // Aguarda um momento e redireciona
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }
    }, 3000); // Verifica a cada 3 segundos

    // Para o polling após 5 minutos para evitar loops infinitos
    setTimeout(() => clearInterval(interval), 300000);
  };

  const regenerateQrCode = () => {
    setLoading(true);
    setError(null);
    setQrCode(null);
    fetchQrCode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 px-6 py-10">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.486"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Conecte seu WhatsApp
          </h1>
          <p className="text-gray-600">
            Para receber suas leituras bíblicas diárias, você precisa conectar seu WhatsApp ao VersoZap.
          </p>
        </div>

        {connectionStatus === 'connected' ? (
          <div className="space-y-4">
            <div className="text-emerald-600">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-emerald-600">WhatsApp Conectado!</h2>
            <p className="text-gray-600">Redirecionando para o dashboard...</p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="space-y-4">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-500">Carregando QR Code...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="text-red-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={regenerateQrCode}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code do WhatsApp"
                  className="mx-auto w-64 h-64 border border-gray-200 rounded-lg shadow-sm"
                />
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Como conectar:</strong></p>
                  <ol className="text-left space-y-1">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em "Configurações" ou nos 3 pontos</li>
                    <li>3. Selecione "Dispositivos conectados"</li>
                    <li>4. Toque em "Conectar um dispositivo"</li>
                    <li>5. Escaneie este QR Code</li>
                  </ol>
                </div>
                <button
                  onClick={regenerateQrCode}
                  className="text-emerald-600 text-sm hover:underline"
                >
                  Gerar novo QR Code
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}