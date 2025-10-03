export default function AssinaturaPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 text-center">
      <h2 className="text-3xl font-bold text-green-700 mb-4">Plano VersoZap Premium</h2>

      <p className="text-gray-700 mb-6 max-w-md">
        Com o plano Premium você terá acesso a isso:
      </p>

      <ul className="text-left text-gray-600 mb-6 list-disc list-inside">
        <li>Leitura com envio por áudio todos os dias</li>
        <li>Confirmação de leitura e reenvio automático</li>
        <li>Escolha de horários personalizados</li>
        <li>Versões adicionais da Bíblia</li>
      </ul>

      <div className="bg-green-100 p-6 rounded-lg shadow max-w-sm w-full">
        <p className="text-lg font-bold text-green-700 mb-2">R$ 9,90 / mês</p>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
          Assinar agora
        </button>
        <p className="text-xs text-gray-500 mt-2">Pagamento seguro via cartão ou Pix</p>
      </div>
    </div>
  );
}
