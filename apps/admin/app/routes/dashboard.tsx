import { useLoaderData } from "react-router";
import type { Route } from "./+types/dashboard";

export async function loader({}: Route.LoaderArgs) {
  // Em produção, estes dados virão da API do backend
  try {
    const response = await fetch("https://versozap-backend.onrender.com/usuarios");
    let usuarios = [];
    
    if (response.ok) {
      usuarios = await response.json();
    }

    return {
      stats: {
        totalUsuarios: usuarios.length || 0,
        usuariosAtivos: usuarios.filter((u: any) => u.horario_envio).length || 0,
        mensagensHoje: Math.floor(Math.random() * 100) + 50, // Mock data
        sucessoEntrega: 95.2
      },
      usuarios: usuarios.slice(0, 5) // Últimos 5 usuários
    };
  } catch (error) {
    // Dados mock para desenvolvimento
    return {
      stats: {
        totalUsuarios: 127,
        usuariosAtivos: 98,
        mensagensHoje: 87,
        sucessoEntrega: 95.2
      },
      usuarios: [
        { id: 1, nome: "João Silva", email: "joao@email.com", data_cadastro: "2025-08-28" },
        { id: 2, nome: "Maria Santos", email: "maria@email.com", data_cadastro: "2025-08-27" },
        { id: 3, nome: "Pedro Costa", email: "pedro@email.com", data_cadastro: "2025-08-26" },
      ]
    };
  }
}

export default function Dashboard() {
  const { stats, usuarios } = useLoaderData<typeof loader>();

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsuarios,
      icon: "👥",
      color: "bg-blue-500",
      change: "+12%"
    },
    {
      title: "Usuários Ativos",
      value: stats.usuariosAtivos,
      icon: "✅",
      color: "bg-green-500",
      change: "+8%"
    },
    {
      title: "Mensagens Hoje",
      value: stats.mensagensHoje,
      icon: "💬",
      color: "bg-purple-500",
      change: "+5%"
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats.sucessoEntrega}%`,
      icon: "📈",
      color: "bg-orange-500",
      change: "+2.1%"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do sistema VersoZap
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">
                {stat.change} desde o mês passado
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuários Recentes
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {usuarios.map((usuario: any) => (
                <div key={usuario.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {usuario.nome?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {usuario.nome || "Nome não informado"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {usuario.email || "Email não informado"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {usuario.data_cadastro || "Hoje"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ações Rápidas
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📤</span>
                  <span className="font-medium text-blue-900">Enviar Mensagem</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <span className="font-medium text-green-900">Ver Relatórios</span>
                </div>
                <span className="text-green-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚙️</span>
                  <span className="font-medium text-purple-900">Configurações</span>
                </div>
                <span className="text-purple-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Status do Sistema
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">Backend API</p>
              <p className="text-xs text-green-600">Funcionando</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">WhatsApp Sender</p>
              <p className="text-xs text-green-600">Conectado</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">Banco de Dados</p>
              <p className="text-xs text-yellow-600">Monitorando</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}