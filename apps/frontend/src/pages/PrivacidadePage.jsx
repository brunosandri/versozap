import { Link } from 'react-router-dom';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-emerald-600">
            VersoZap
          </Link>
          <Link to="/" className="text-sm text-emerald-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
          <p className="text-gray-600 leading-relaxed">
            Esta política explica como coletamos, utilizamos e protegemos os seus dados pessoais ao utilizar o VersoZap.
            Prezamos pela transparência e segurança das informações dos nossos usuários.
          </p>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">1. Dados coletados</h2>
            <p className="text-gray-600 leading-relaxed">
              Coletamos apenas as informações necessárias para realizar o envio das mensagens, como nome, e-mail,
              número de WhatsApp e preferências de leitura. Os dados são utilizados exclusivamente para prestar o serviço.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">2. Armazenamento e segurança</h2>
            <p className="text-gray-600 leading-relaxed">
              Os dados ficam armazenados de forma segura e com acesso restrito. Utilizamos práticas recomendadas de segurança
              para proteger as informações contra acesso não autorizado, alteração ou divulgação indevida.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">3. Compartilhamento de dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Não compartilhamos seus dados com terceiros sem o seu consentimento, exceto quando exigido por lei
              ou para garantir o funcionamento do serviço (por exemplo, provedores de envio do WhatsApp).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">4. Direitos do usuário</h2>
            <p className="text-gray-600 leading-relaxed">
              Você pode solicitar a atualização ou remoção dos seus dados entrando em contato com a equipe de suporte.
              Também pode cancelar o recebimento das mensagens a qualquer momento.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Contato</h2>
          <p className="text-gray-600 leading-relaxed">
            Para dúvidas sobre privacidade, envie um e-mail para privacidade@versozap.com.br ou utilize o canal de suporte oficial.
          </p>
        </section>
      </main>
    </div>
  );
}