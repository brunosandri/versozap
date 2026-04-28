const DEFAULT_API_BASE_URL = 'https://versozap-backend.onrender.com';

const normalizeBaseUrl = (base) => {
  const trimmed = base.trim();
  return trimmed.replace(/\/+$/, '');
};

const resolveBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_URL ?? '';
  if (envBase) {
    return normalizeBaseUrl(envBase);
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }

  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = resolveBaseUrl();

/**
 * Monta uma URL completa para os endpoints da API, respeitando a configuração do ambiente.
 * Quando nenhuma URL é fornecida, os caminhos permanecem relativos (ex.: `/api/login`).
 *
 * @param {string} path Caminho do endpoint iniciando com '/'
 * @returns {string}
 */
export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    throw new Error('Paths passados para apiUrl devem começar com "/".');
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};

/**
 * Converte a resposta HTTP em JSON tratando respostas vazias ou inválidas e produzindo
 * mensagens de erro amigáveis quando a API não está acessível.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
export const parseJsonResponse = async (response) => {
  const text = await response.text();
  const trimmed = text.trim();
  let data = null;

  if (trimmed) {
    try {
      data = JSON.parse(trimmed);
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.erro || data.message || data.mensagem)) ||
      trimmed ||
      'Erro ao se comunicar com o servidor. Verifique se o backend está rodando.';

    throw new Error(message);
  }

  if (!trimmed) {
    return {};
  }

  if (data === null) {
    throw new Error('Resposta inválida do servidor.');
  }

  return data;
};