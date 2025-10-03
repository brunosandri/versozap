import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    versao_biblia: 'ARC',
    plano_leitura: 'cronologico',
    horario_envio: '08:00'
  });
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('versozap_token');
    const userData = localStorage.getItem('versozap_user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      // Carregar preferências do usuário
      const token = localStorage.getItem('versozap_token');
      
      // Mock data para desenvolvimento - em produção viria da API
      const mockHistory = [
        { id: 1, date: '2025-08-28', reading: 'Gênesis 1:1-31', completed: true },
        { id: 2, date: '2025-08-27', reading: 'Mateus 5:1-48', completed: true },
        { id: 3, date: '2025-08-26', reading: 'Salmos 23:1-6', completed: false },
        { id: 4, date: '2025-08-25', reading: 'João 3:16-21', completed: true },
        { id: 5, date: '2025-08-24', reading: 'Provérbios 3:1-12', completed: true },
      ];

      setReadingHistory(mockHistory);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('versozap_token');
      
      // Em produção, enviaria para /api/atualizar-preferencias
      const response = await fetch('/api/atualizar-preferencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          ...preferences
        })
      });

      if (response.ok) {
        alert('Preferências salvas com sucesso!');
      } else {
        alert('Erro ao salvar preferências');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('versozap_token');
    localStorage.removeItem('versozap_user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const completedThisWeek = readingHistory.filter(r => r.completed).length;
  const totalReadings = readingHistory.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Meu VersoZap
              </h1>
              <p className="text-gray-600">
                Olá, {user?.email || 'Usuário'}! Gerencie suas preferências de leitura bíblica.
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Estatísticas */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📖</div>
                  <div>
                    <p className="text-sm text-gray-600">Leituras esta semana</p>
                    <p className="text-2xl font-bold text-emerald-600">{completedThisWeek}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🔥</div>
                  <div>
                    <p className="text-sm text-gray-600">Sequência atual</p>
                    <p className="text-2xl font-bold text-orange-600">7 dias</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">⭐</div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa de conclusão</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round((completedThisWeek / totalReadings) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Minhas Preferências
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versão da Bíblia
                  </label>
                  <select
                    value={preferences.versao_biblia}
                    onChange={(e) => setPreferences({...preferences, versao_biblia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="ARC">Almeida Revista e Corrigida</option>
                    <option value="NVI">Nova Versão Internacional</option>
                    <option value="ACF">Almeida Corrigida Fiel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano de Leitura
                  </label>
                  <select
                    value={preferences.plano_leitura}
                    onChange={(e) => setPreferences({...preferences, plano_leitura: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="cronologico">Cronológico</option>
                    <option value="livros">Por Livros</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {preferences.plano_leitura === 'cronologico' 
                      ? 'Leitura em ordem cronológica dos eventos bíblicos'
                      : 'Leitura por ordem dos livros (NT primeiro)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Envio
                  </label>
                  <input
                    type="time"
                    value={preferences.horario_envio}
                    onChange={(e) => setPreferences({...preferences, horario_envio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Horário que você recebe os versículos diariamente
                  </p>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </div>
          </div>

          {/* Histórico de Leituras */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Leituras Recentes
              </h2>
              
              <div className="space-y-4">
                {readingHistory.map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {reading.reading}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reading.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      {reading.completed ? (
                        <span className="text-green-600 text-xl">✅</span>
                      ) : (
                        <span className="text-gray-400 text-xl">⏸️</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Continue sua jornada de fé! 🙏
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leitura de Hoje */}
        <div className="mt-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">📖</div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Leitura de Hoje
              </h3>
            </div>
            <div className="text-emerald-800 mb-4">
              <p className="font-medium">Gênesis 1:1-31</p>
              <p className="text-sm">Versão: {preferences.versao_biblia}</p>
            </div>
            <p className="text-emerald-700 text-sm leading-relaxed">
              "No princípio criou Deus os céus e a terra..."
            </p>
            <div className="mt-4">
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm">
                Marcar como Lida
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}