import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CadastroFacebook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Carrega o SDK do Facebook
  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'seu-facebook-app-id',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    // Carrega o SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/pt_BR/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFacebookLogin = () => {
    setLoading(true);
    setError('');

    if (!window.FB) {
      setError('SDK do Facebook não carregado. Recarregue a página.');
      setLoading(false);
      return;
    }

    window.FB.login(function(response) {
      if (response.authResponse) {
        // Usuário autenticado com sucesso
        authenticateWithBackend(response.authResponse.accessToken);
      } else {
        setError('Login cancelado pelo usuário');
        setLoading(false);
      }
    }, { scope: 'email' });
  };

  const authenticateWithBackend = async (accessToken) => {
    try {
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken
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
        setError(data.erro || 'Erro ao fazer login com Facebook');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">f</span>
        </div>
        <h2 className="text-2xl font-bold">Conectar com Facebook</h2>
        <p className="text-gray-600 text-sm">
          Faça login com sua conta Facebook para continuar.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Conectando...
            </>
          ) : (
            'Conectar com Facebook'
          )}
        </button>

        <div className="text-sm text-gray-500">
          Ao continuar, você aceita nossos termos de uso e política de privacidade.
        </div>
      </div>
    </div>
  );
}
