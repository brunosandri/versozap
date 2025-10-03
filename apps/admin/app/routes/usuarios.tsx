import { useLoaderData, useFetcher } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/usuarios";

export async function loader({}: Route.LoaderArgs) {
  try {
    const response = await fetch("https://versozap-backend.onrender.com/usuarios");
    if (response.ok) {
      const usuarios = await response.json();
      return { usuarios };
    }
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
  
  // Mock data para desenvolvimento
  return {
    usuarios: [
      {
        id: 1,
        nome: "João Silva",
        email: "joao@email.com",
        telefone: "11999999999",
        versao_biblia: "ARC",
        plano_leitura: "cronologico",
        horario_envio: "08:00"
      },
      {
        id: 2,
        nome: "Maria Santos",
        email: "maria@email.com",
        telefone: "11888888888",
        versao_biblia: "NVI",
        plano_leitura: "livros",
        horario_envio: "19:00"
      },
      {
        id: 3,
        nome: "Pedro Costa",
        email: "pedro@email.com",
        telefone: "11777777777",
        versao_biblia: "ACF",
        plano_leitura: "cronologico",
        horario_envio: "07:00"
      }
    ]
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "delete") {
    const userId = formData.get("userId");
    // TODO: Implementar delete no backend
    console.log("Deletar usuário:", userId);
    return { success: true };
  }
  
  return { success: false };
}

export default function Usuarios() {
  const { usuarios } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const filteredUsuarios = usuarios.filter((usuario: any) => {
    const matchesSearch = 
      usuario.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.telefone?.includes(searchTerm);

    const matchesFilter = 
      filterBy === "all" ||
      (filterBy === "active" && usuario.horario_envio) ||
      (filterBy === "inactive" && !usuario.horario_envio);

    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      fetcher.submit(
        { action: "delete", userId: userId.toString() },
        { method: "post" }
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-2 text-gray-600">
            Gerencie todos os usuários do VersoZap
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsuarios.length} usuário(s) encontrado(s)
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferências
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.map((usuario: any) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {usuario.nome?.charAt(0) || "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome || "Nome não informado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {usuario.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.email || "Sem email"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {usuario.telefone || "Sem telefone"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.versao_biblia || "ARC"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {usuario.plano_leitura === "cronologico" ? "Cronológico" : "Por Livros"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.horario_envio || "Não definido"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.horario_envio
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {usuario.horario_envio ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded">
                        Editar
                      </button>
                      <button className="text-green-600 hover:text-green-900 px-2 py-1 rounded">
                        Enviar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usuario.id)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Tente ajustar os filtros de busca" : "Ainda não há usuários cadastrados"}
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-blue-500">👥</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-green-500">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {usuarios.filter((u: any) => u.horario_envio).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl text-red-500">⏸️</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {usuarios.filter((u: any) => !u.horario_envio).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}