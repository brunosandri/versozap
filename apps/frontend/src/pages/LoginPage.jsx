import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl, parseJsonResponse } from '../utils/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'E-mail obrigatório';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Formato de e-mail inválido';

    if (!form.password) errs.password = 'Senha obrigatória';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const { token, user } = await parseJsonResponse(res);

      if (!token || !user) {
        throw new Error('Resposta inválida do servidor.');
      }

      // Salva token e dados do usuário
      localStorage.setItem('versozap_token', token);
      localStorage.setItem('versozap_user', JSON.stringify(user));

      // Verifica se usuário precisa completar cadastro
      if (!user.telefone) {
        navigate('/completar-cadastro');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setErrors({ api: 'Erro de conexão. Verifique se o backend está rodando.' });
      } else {
        setErrors({ api: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/imagens/logoversozap.png" className="h-8" alt="Logo Versozap" />
          <Link to="/cadastro/email" className="text-sm text-emerald-600 hover:underline">
            Não tem conta? Cadastrar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Entrar</h1>
            <p className="text-gray-600 mt-2">Acesse sua conta VersoZap</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Sua senha"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {errors.api && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.api}
            </div>
          )}

          <div className="text-center mt-6">
            <div className="text-sm text-gray-500 mb-4">Ou entre com:</div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.location.href = apiUrl('/api/auth/google/callback')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <button
                type="button"
                onClick={() => window.location.href = apiUrl('/api/auth/facebook/callback')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuar com Facebook
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}