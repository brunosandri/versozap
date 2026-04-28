import { useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/logs";

export async function loader({}: Route.LoaderArgs) {
  // Mock data para logs - em produção viria do backend
  const mockLogs = [
    {
      id: 1,
      timestamp: "2025-08-28 09:30:15",
      level: "INFO",
      category: "AUTH",
      message: "Usuário joão@email.com fez login via Google",
      details: { userId: 123, provider: "google", ip: "192.168.1.1" }
    },
    {
      id: 2,
      timestamp: "2025-08-28 09:25:42",
      level: "SUCCESS",
      category: "MESSAGE",
      message: "Mensagem enviada com sucesso para +5511999999999",
      details: { userId: 123, telefone: "+5511999999999", trecho: "João 3:16" }
    },
    {
      id: 3,
      timestamp: "2025-08-28 09:20:11",
      level: "ERROR",
      category: "WHATSAPP",
      message: "Falha ao conectar com WhatsApp API",
      details: { error: "Connection timeout", retryAttempt: 3 }
    },
    {
      id: 4,
      timestamp: "2025-08-28 09:15:33",
      level: "INFO",
      category: "BIBLE",
      message: "Leitura do dia carregada: Gênesis 1:1-31",
      details: { dia: 240, plano: "cronologico", versao: "ARC" }
    },
    {
      id: 5,
      timestamp: "2025-08-28 09:10:55",
      level: "WARNING",
      category: "SYSTEM",
      message: "Alto uso de CPU detectado (85%)",
      details: { cpuUsage: 85, memoryUsage: 67, diskUsage: 45 }
    },
    {
      id: 6,
      timestamp: "2025-08-28 09:05:20",
      level: "INFO",
      category: "USER",
      message: "Novo usuário cadastrado: maria@email.com",
      details: { userId: 124, provider: "facebook", versao: "NVI" }
    }
  ];

  return { logs: mockLogs };
}

export default function Logs() {
  const { logs } = useLoaderData<typeof loader>();
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log: any) => {
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "INFO":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return "❌";
      case "WARNING":
        return "⚠️";
      case "SUCCESS":
        return "✅";
      case "INFO":
      default:
        return "ℹ️";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AUTH":
        return "🔐";
      case "MESSAGE":
        return "💬";
      case "WHATSAPP":
        return "📱";
      case "BIBLE":
        return "📖";
      case "SYSTEM":
        return "⚙️";
      case "USER":
        return "👤";
      default:
        return "📋";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs do Sistema</h1>
        <p className="mt-2 text-gray-600">
          Monitore todas as atividades e eventos do VersoZap
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar nos logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os níveis</option>
              <option value="ERROR">Erro</option>
              <option value="WARNING">Aviso</option>
              <option value="SUCCESS">Sucesso</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="AUTH">Autenticação</option>
              <option value="MESSAGE">Mensagens</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="BIBLE">Bíblia</option>
              <option value="SYSTEM">Sistema</option>
              <option value="USER">Usuário</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["ERROR", "WARNING", "SUCCESS", "INFO"].map((level) => {
          const count = logs.filter((log: any) => log.level === level).length;
          return (
            <div key={level} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{level}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-2xl">{getLevelIcon(level)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mensagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                      <span className="mr-1">{getLevelIcon(log.level)}</span>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-sm text-gray-900">
                      <span className="mr-2">{getCategoryIcon(log.category)}</span>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:text-blue-800">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum log encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        </p>
      </div>
    </div>
  );
}