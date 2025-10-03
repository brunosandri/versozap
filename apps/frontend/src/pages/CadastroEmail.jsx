import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CadastroEmail() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'E-mail obrigatório';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Formato de e-mail inválido';

    if (!form.password) errs.password = 'Senha obrigatória';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';

    if (form.confirm !== form.password) errs.confirm = 'As senhas não coincidem';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha no cadastro');
      }

      // Após cadastro bem-sucedido, faz login automático
      const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (loginRes.ok) {
        const { token } = await loginRes.json();
        localStorage.setItem('versozap_token', token);
        navigate('/completar-cadastro');
      } else {
        const loginError = await loginRes.json();
        throw new Error(loginError.error || 'Erro no login automático');
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
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
          <Link to="/login" className="text-sm text-emerald-600 hover:underline">
            Já tem conta? Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Cadastro por e-mail</h1>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="confirm">Confirmar senha</label>
            <input
              id="confirm"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.confirm ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Registrando…' : 'Registrar'}
          </button>

          {errors.api && <p className="text-red-500 text-sm text-center">{errors.api}</p>}
        </form>
      </main>
    </div>
  );
}