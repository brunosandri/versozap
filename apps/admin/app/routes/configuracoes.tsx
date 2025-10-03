import { useFetcher } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/configuracoes";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  
  // TODO: Implementar salvamento das configurações no backend
  console.log("Salvando configurações:", Object.fromEntries(formData));
  
  return { success: true, message: "Configurações salvas com sucesso!" };
}

export default function Configuracoes() {
  const fetcher = useFetcher<typeof action>();
  const [activeTab, setActiveTab] = useState("sistema");

  const tabs = [
    { id: "sistema", name: "Sistema", icon: "⚙️" },
    { id: "whatsapp", name: "WhatsApp", icon: "📱" },
    { id: "bible", name: "Bíblia", icon: "📖" },
    { id: "notificacoes", name: "Notificações", icon: "🔔" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">
          Gerencie as configurações globais do VersoZap
        </p>
      </div>

      {/* Success message */}
      {fetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="text-green-400 mr-3">✅</div>
            <p className="text-green-800">{fetcher.data.message}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sistema Tab */}
          {activeTab === "sistema" && (
            <fetcher.Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="sistema" />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configurações do Sistema
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Aplicação
                    </label>
                    <input
                      type="text"
                      name="app_name"
                      defaultValue="VersoZap"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      defaultValue="America/Sao_Paulo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de usuários simultâneos
                    </label>
                    <input
                      type="number"
                      name="max_users"
                      defaultValue="1000"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo de backup (horas)
                    </label>
                    <input
                      type="number"
                      name="backup_interval"
                      defaultValue="24"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="debug_mode"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Ativar modo debug
                    </span>
                  </label>
                </div>
              </div>
            </fetcher.Form>
          )}

          {/* WhatsApp Tab */}
          {activeTab === "whatsapp" && (
            <fetcher.Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="whatsapp" />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configurações do WhatsApp
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL do Sender
                    </label>
                    <input
                      type="url"
                      name="sender_url"
                      defaultValue="https://versozap-sender-v2-production.up.railway.app"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de conexão (ms)
                    </label>
                    <input
                      type="number"
                      name="connection_timeout"
                      defaultValue="30000"
                      min="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentativas de reenvio
                    </label>
                    <input
                      type="number"
                      name="retry_attempts"
                      defaultValue="3"
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo entre envios (segundos)
                    </label>
                    <input
                      type="number"
                      name="send_interval"
                      defaultValue="2"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_audio"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enviar mensagens com áudio
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enable_delivery_receipt"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Confirmar entrega das mensagens
                    </span>
                  </label>
                </div>
              </div>
            </fetcher.Form>
          )}

          {/* Bible Tab */}
          {activeTab === "bible" && (
            <fetcher.Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="bible" />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configurações da Bíblia
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versão padrão
                    </label>
                    <select
                      name="default_version"
                      defaultValue="ARC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ARC">Almeida Revista e Corrigida</option>
                      <option value="NVI">Nova Versão Internacional</option>
                      <option value="ACF">Almeida Corrigida Fiel</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plano padrão
                    </label>
                    <select
                      name="default_plan"
                      defaultValue="cronologico"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cronologico">Cronológico</option>
                      <option value="livros">Por Livros</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário padrão de envio
                    </label>
                    <input
                      type="time"
                      name="default_send_time"
                      defaultValue="08:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Externa (opcional)
                    </label>
                    <input
                      type="url"
                      name="external_bible_api"
                      placeholder="https://bible-api.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem de boas-vindas
                  </label>
                  <textarea
                    name="welcome_message"
                    rows={4}
                    defaultValue="🙏 Bem-vindo ao VersoZap! Você receberá versículos bíblicos diariamente. Que Deus abençoe sua jornada de fé!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </fetcher.Form>
          )}

          {/* Notificações Tab */}
          {activeTab === "notificacoes" && (
            <fetcher.Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="notificacoes" />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configurações de Notificações
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email do administrador
                    </label>
                    <input
                      type="email"
                      name="admin_email"
                      defaultValue="admin@versozap.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL (opcional)
                    </label>
                    <input
                      type="url"
                      name="webhook_url"
                      placeholder="https://hooks.slack.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-medium text-gray-900">Notificar quando:</h4>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_new_user"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Novo usuário se cadastra
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_system_error"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Erro no sistema ocorre
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_whatsapp_disconnect"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      WhatsApp desconecta
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_daily_stats"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Relatório diário de estatísticas
                    </span>
                  </label>
                </div>
              </div>
            </fetcher.Form>
          )}

          {/* Save button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) {
                    fetcher.submit(form);
                  }
                }}
                disabled={fetcher.state === "submitting"}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {fetcher.state === "submitting" ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informações do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-600">Versão:</p>
            <p className="font-semibold">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">Última atualização:</p>
            <p className="font-semibold">28/08/2025</p>
          </div>
          <div>
            <p className="text-gray-600">Uptime:</p>
            <p className="font-semibold">2d 14h 32m</p>
          </div>
        </div>
      </div>
    </div>
  );
}