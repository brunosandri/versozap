import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/imagens/logoversozap.png" className="h-10" />
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {/* Link interno para a página de login */}
            <Link to="/login" className="hover:text-emerald-600">
              Entrar
            </Link>

            {/* Link interno para a página de cadastro */}
            <Link
              to="/cadastro"
              className="px-4 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col-reverse lg:flex-row items-center max-w-6xl mx-auto px-6 py-20 gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left mt-12 lg:mt-0">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Leia a bíblia <span className="text-emerald-500">diariamente</span><br />
            no seu WhatsApp
          </h1>
          <p className="mt-6 text-gray-600 text-base md:text-lg max-w-md mx-auto lg:mx-0">
            Escolha a versão, o plano de leitura e o horário para começar o seu cronograma de leitura
          </p>

          {/* Botão principal direcionando para cadastro */}
          <Link
            to="/cadastro"
            className="inline-block mt-8 px-6 py-3 bg-emerald-500 text-white font-medium rounded hover:bg-emerald-600 transition"
          >
            Comece agora!
          </Link>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src="/imagens/imagemlanding.png"
            alt="Exemplo de conversa no WhatsApp"
            className="w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px]"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-500 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Versozap • 2025</p>
          <div className="flex gap-4">
            {/* Mantenha <a> para links externos ou coloque rotas internas se existirem */}
            <Link to="/termos" className="hover:text-emerald-500">Termos de uso</Link>
            <Link to="/privacidade" className="hover:text-emerald-500">Política de privacidade</Link>
            <a href="https://instagram.com/versozap" target="_blank" rel="noreferrer" className="hover:text-emerald-500">@versozap</a>
          </div>
          <select className="bg-transparent outline-none">
            <option>PT-BR</option>
            <option>EN</option>
          </select>
        </div>
      </footer>
    </div>
  );
}


