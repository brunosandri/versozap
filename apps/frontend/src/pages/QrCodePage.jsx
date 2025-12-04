import { useEffect, useState, useRef } from 'react';

export default function QrCodePage() {
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeAscii, setQrCodeAscii] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    fetchQrCode();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const fetchQrCode = async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      setStatusMessage(null);
      setQrCodeAscii(null);
      setRetryAttempt(attempt);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      const response = await fetch(
        `${import.meta.env.VITE_SENDER_URL || 'https://versozap-sender-git-main-versozap.vercel.app'}/qrcode`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const data = await response.json();
      if (response.status === 202) {
        const retryDelay = Math.min(1000 * Math.pow(1.5, attempt), 10000); // Exponential backoff, max 10s
        setStatusMessage(
          `${data?.message || 'QR Code ainda não disponível, aguardando...'} (tentativa ${attempt + 1})`
        );
        setQrCode(null);
        setQrCodeAscii(null);

        // Auto retry após delay
        if (attempt < 10) {
          retryTimeoutRef.current = setTimeout(() => fetchQrCode(attempt + 1), retryDelay);
        } else {
          setError('Tempo limite excedido. Por favor, tente novamente manualmente.');
          setLoading(false);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data?.erro || data?.message || 'Não foi possível obter o QR Code.');
      }

      const imageSource = data.qrCodeDataUri || (data.qrCode ? `data:image/png;base64,${data.qrCode}` : null);
      setQrCode(imageSource);
      setQrCodeAscii(data.asciiQr || null);
      if (!imageSource && !data.asciiQr && data?.message) {
        setStatusMessage(data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);

      if (error.name === 'AbortError') {
        setError('Tempo limite de conexão excedido. Verifique sua conexão e tente novamente.');
      } else {
        setError(error.message || 'Falha desconhecida ao carregar o QR Code.');
      }
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (!loading) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      fetchQrCode(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Conecte seu WhatsApp
        </h1>
        <p className="mb-6 text-gray-600">Escaneie o QR Code com seu WhatsApp para autorizar o envio automático.</p>
        {loading ? (
          <p className="text-gray-500">Carregando QR Code...</p>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Tentar novamente
            </button>
            {statusMessage && <p className="text-gray-500 text-sm">{statusMessage}</p>}
          </div>
        ) : qrCode ? (
          <img
            src={qrCode}
            alt="QR Code do WhatsApp"
            className="mx-auto w-72 h-72 border border-gray-300 shadow-md"
          />
        ) : qrCodeAscii ? (
          <pre className="mx-auto w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg p-4 text-left text-xs leading-tight overflow-x-auto">
            {qrCodeAscii}
          </pre>
        ) : statusMessage ? (
          <p className="text-gray-600">{statusMessage}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-red-500">Falha ao carregar o QR Code.</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}