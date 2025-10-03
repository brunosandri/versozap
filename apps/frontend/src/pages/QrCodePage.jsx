import { useEffect, useState } from 'react';

export default function QrCodePage() {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQrCode();
  }, []);

  const fetchQrCode = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SENDER_URL || 'https://versozap-sender-v2-production.up.railway.app'}/qrcode`);
      const data = await response.json();
      setQrCode(data.qrCode);  // supondo que venha base64
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
    } finally {
      setLoading(false);
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
        ) : qrCode ? (
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code do WhatsApp"
            className="mx-auto w-72 h-72 border border-gray-300 shadow-md"
          />
        ) : (
          <p className="text-red-500">Falha ao carregar o QR Code.</p>
        )}
      </div>
    </div>
  );
}