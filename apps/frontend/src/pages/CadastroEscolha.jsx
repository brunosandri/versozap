import { useState } from "react";
import axios from "axios";

export default function CadastroEscolha() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    versao_biblia: "NVI",
    plano_leitura: "12 meses",
    tipo_ordem: "tradicional",
    horario_envio: "08:00",
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register-phone`, form);
      setMensagem("Cadastro realizado com sucesso!");
      console.log(response.data);
      window.location.href = "/configurar-whatsapp"; // Redireciona para configurar WhatsApp
    } catch (err) {
      setMensagem("Erro ao cadastrar usuário");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Preencha seus dados</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="telefone" placeholder="WhatsApp com DDD" value={form.telefone} onChange={handleChange} className="w-full border p-2 rounded" required />

        <select name="versao_biblia" value={form.versao_biblia} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="NVI">NVI</option>
          <option value="ARA">ARA</option>
          <option value="NTLH">NTLH</option>
        </select>

        <select name="plano_leitura" value={form.plano_leitura} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="6 meses">6 meses (rápido)</option>
          <option value="12 meses">12 meses (regular)</option>
          <option value="18 meses">18 meses (no seu ritmo)</option>
        </select>

        <select name="tipo_ordem" value={form.tipo_ordem} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="tradicional">Tradicional</option>
          <option value="cronológica">Cronológica</option>
        </select>

        <input name="horario_envio" type="time" value={form.horario_envio} onChange={handleChange} className="w-full border p-2 rounded" />

        <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded hover:bg-emerald-600">
          Finalizar Cadastro
        </button>
      </form>

      {mensagem && <p className="mt-4 text-center text-sm text-gray-700">{mensagem}</p>}
    </div>
  );
}

