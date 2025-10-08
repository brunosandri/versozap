import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrl, parseJsonResponse } from '../utils/api';

export default function CompletarCadastro() {
  const [form, setForm] = useState({
    telefone: '',
    versao_biblia: 'ARC',
    plano_leitura: 'cronologico',
    horario_envio: '08:00',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('versozap_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (error) {
          console.error('Erro ao ler usuário do armazenamento local:', error);
        }
      }
    }
    return null;
  });
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verifica se há token na URL (de auth social) ou localStorage
    const tokenFromUrl = searchParams.get('token');
    const storedToken = localStorage.getItem('versozap_token');
    const token = tokenFromUrl || storedToken;

    if (!token) {
      setErrors({ api: 'Sua sessão expirou. Faça login novamente.' });
      setIsValidatingToken(false);
      navigate('/login');
      return;
    }

    // Salva token e valida
    localStorage.setItem('versozap_token', token);
    setIsValidatingToken(true);
    validateTokenAndGetUser(token);
  }, [navigate, searchParams]);

  const validateTokenAndGetUser = async (token) => {
    try {
      const response = await fetch(apiUrl('/api/auth/validate'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await parseJsonResponse(response);
      const parsedUser = data?.user || data;
      setUserInfo(parsedUser);
      try {
        localStorage.setItem('versozap_user', JSON.stringify(parsedUser));
      } catch (error) {
        console.error('Erro ao salvar usuário no armazenamento local:', error);
      }
        } catch (error) {
          console.error('Erro ao salvar usuário no armazenamento local:', error);
        const message =
        error.name === 'TypeError'
          ? 'Erro de conexão. Verifique se o backend está rodando.'
          : error.message;
      setErrors({ api: message });
      navigate('/login');
    }
    setIsValidatingToken(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errs = {};

    if (!form.telefone) {
      errs.telefone = 'Telefone é obrigatório';
    } else if (!/^\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/.test(form.telefone.replace(/\s/g, ''))) {
      errs.telefone = 'Formato: (11) 99999-9999';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('versozap_token');

      // Atualiza perfil do usuário com telefone e preferências
      const response = await fetch(apiUrl('/api/user/update-profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          telefone: form.telefone.replace(/\D/g, ''),
          versao_biblia: form.versao_biblia,
          plano_leitura: form.plano_leitura,
          horario_envio: form.horario_envio
        }),
      });
      await parseJsonResponse(response);

      // Redireciona para configurar WhatsApp
      navigate('/configurar-whatsapp');
    } catch (err) {
      const message =
        err.name === 'TypeError'
          ? 'Erro de conexão. Verifique se o backend está rodando.'
          : err.message;
      setErrors({ api: message });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, telefone: formatted });
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-blue-50">
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/imagens/logoversozap.png" className="h-8" alt="Logo Versozap" />
          <span className="text-sm text-gray-600">
            Olá, {userInfo?.email || 'bem-vindo(a)'}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Complete seu perfil</h1>
            <p className="text-gray-600 mt-2">
              Só mais alguns dados para personalizar sua experiência
            </p>
          </div>

          {errors.api && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp (com DDD)
              </label>
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Usado para enviar suas leituras diárias
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Versão da Bíblia
              </label>
              <select
                name="versao_biblia"
                value={form.versao_biblia}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ARC">Almeida Revista e Corrigida</option>
                <option value="ARA">Almeida Revista e Atualizada</option>
                <option value="NVI">Nova Versão Internacional</option>
                <option value="NTLH">Nova Tradução na Linguagem de Hoje</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plano de Leitura
              </label>
              <select
                name="plano_leitura"
                value={form.plano_leitura}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cronologico">Cronológico (1 ano)</option>
                <option value="sequencial">Sequencial (livro por livro)</option>
                <option value="tematico">Temático (por assunto)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Envio
              </label>
              <input
                type="time"
                name="horario_envio"
                value={form.horario_envio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Salvando...' : 'Continuar para WhatsApp'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}