import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react'; // Ícones opcionais

export default function Cadastro() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <img src="/imagens/logoversozap.png" alt="Logo" className="h-10 mb-12" />

      {/* Título */}
      <h1 className="text-2xl font-bold mb-8 text-center">o que você prefere?</h1>

      {/* Botões de cadastro */}
      <div className="space-y-4 w-full max-w-sm">
        <button
        onClick={() => navigate("/cadastro/email")}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-md hover:bg-emerald-600 transition">
          <span>Continuar com e-mail</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H4m0 0l4-4m-4 4l4 4" />
          </svg>
        </button>

        {/* Botão: Google */}
        <button
          onClick={() => navigate("/cadastro/google")}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-md hover:bg-gray-100 transition"
        >
          <img src="/imagens/google-icon.png" alt="Google" className="h-5 w-5" />
          <span className="text-sm text-gray-700">Continuar com Google</span>
        </button>

        {/* Botão: Facebook */}
        <button
          onClick={() => navigate("/cadastro/facebook")}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
        >
          <img src="/imagens/facebook-icon.png" alt="Facebook" className="h-5 w-5" />
          <span className="text-sm">Continuar com Facebook</span>
        </button>
      </div>

      {/* Link para login */}
      <div className="mt-6 text-sm text-emerald-600 flex items-center gap-1">
        <Link to="/login" className="hover:underline">Já tenho uma conta</Link>
        <ArrowRight size={16} />
      </div>

      {/* Rodapé */}
      <footer className="mt-16 text-xs text-gray-500 text-center space-y-1">
        <p><a href="#" className="hover:text-emerald-500">Termos de uso</a></p>
        <p><a href="#" className="hover:text-emerald-500">Política de privacidade</a></p>
        <p><Link to="/" className="hover:text-emerald-500">← Início</Link></p>
      </footer>
    </div>
  );
}