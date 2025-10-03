import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function SucessoPage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há token na URL (para OAuth redirect)
    const tokenFromUrl = searchParams.get('token');

    if (tokenFromUrl) {
      // Salva o token do OAuth redirect
      localStorage.setItem('versozap_token', tokenFromUrl);

      // Valida o token com o backend
      validateToken(tokenFromUrl);
    } else {
      // Verifica token existente no localStorage
      const existingToken = localStorage.getItem('versozap_token');
      const existingUser = localStorage.getItem('versozap_user');

      if (existingToken && existingUser) {
        setUser(JSON.parse(existingUser));
        setLoading(false);
      } else {
        // Não há autenticação, redireciona para login
        navigate('/login');
      }
    }
  }, [searchParams, navigate]);

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userInfo = {
          id: data.user_id,
          email: data.email
        };

        localStorage.setItem('versozap_user', JSON.stringify(userInfo));
        setUser(userInfo);
      } else {
        // Token inválido, limpa e redireciona
        localStorage.removeItem('versozap_token');
        localStorage.removeItem('versozap_user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p>Finalizando cadastro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 text-center min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="text-3xl font-semibold mb-4 text-green-700">
          Bem-vindo ao VersoZap!
        </h2>

        {user && (
          <p className="text-gray-600 mb-6">
            Olá, <span className="font-semibold">{user.email}</span>!
            Seu cadastro foi concluído com sucesso.
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Próximos Passos:</h3>
          <ol className="text-sm text-blue-800 text-left space-y-2">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
              Conecte seu WhatsApp clicando no botão abaixo
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
              Escaneie o QR Code com seu WhatsApp
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
              Receba versículos bíblicos diariamente!
            </li>
          </ol>
        </div>

        <a
          href="/configurar-whatsapp"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition mb-4"
        >
          📱 Conectar WhatsApp
        </a>

        <div className="text-sm text-gray-500">
          Você receberá mensagens diárias com versículos bíblicos no seu WhatsApp.
        </div>
      </div>
    </div>
  );
}