import { Link } from 'react-router-dom';

export default function TermosPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
          <p className="text-gray-600 leading-relaxed">
            Estes termos de uso descrevem as regras e condições para utilizar o VersoZap.
            Ao acessar a plataforma você concorda em seguir todas as diretrizes descritas aqui.
          </p>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">1. Uso da plataforma</h2>
            <p className="text-gray-600 leading-relaxed">
              O VersoZap oferece versículos bíblicos diários enviados pelo WhatsApp. O serviço é destinado a
              uso pessoal. É proibido utilizar a plataforma para fins ilegais, ofensivos ou para enviar spam.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">2. Cadastro e autenticação</h2>
            <p className="text-gray-600 leading-relaxed">
              Para receber as mensagens é necessário criar uma conta válida e confirmar o acesso ao WhatsApp.
              Você é responsável por manter suas credenciais seguras e por atualizar seus dados quando necessário.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">3. Conteúdo enviado</h2>
            <p className="text-gray-600 leading-relaxed">
              Os versículos são enviados com base nas preferências escolhidas. O conteúdo pode incluir textos bíblicos
              e áudios. Ao utilizar o serviço você concorda em receber as mensagens no horário configurado.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">4. Cancelamento</h2>
            <p className="text-gray-600 leading-relaxed">
              Você pode cancelar o envio de mensagens a qualquer momento acessando seu painel ou entrando em contato
              com o suporte. O cancelamento é imediato e remove o agendamento de novas mensagens.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Contato</h2>
          <p className="text-gray-600 leading-relaxed">
            Caso tenha dúvidas sobre estes termos, envie um e-mail para suporte@versozap.com.br.
          </p>
        </section>
      </main>
    </div>
  );
}