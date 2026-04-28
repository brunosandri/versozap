import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CadastroGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Carrega o script do Google
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'seu-google-client-id',
          callback: handleGoogleResponse
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Salva token no localStorage
        localStorage.setItem('versozap_token', data.token);
        localStorage.setItem('versozap_user', JSON.stringify(data.user));
        
        // Redireciona para sucesso
        navigate('/sucesso');
      } else {
        setError(data.erro || 'Erro ao fazer login com Google');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('SDK do Google não carregado. Recarregue a página.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="max-w-md w-full text-center space-y-6">
        <img src="/imagens/google-icon.svg" alt="Google" className="w-12 mx-auto" />
        <h2 className="text-2xl font-bold">Conectar com Google</h2>
        <p className="text-gray-600 text-sm">
          Faça login com sua conta Google para continuar.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Conectando...
            </>
          ) : (
            'Conectar com Google'
          )}
        </button>

        <div className="text-sm text-gray-500">
          Ao continuar, você aceita nossos termos de uso e política de privacidade.
        </div>
      </div>
    </div>
  );
}
