const normalizeBaseUrl = (base: string) => base.trim().replace(/\/+$/, "");

const resolveBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_URL ?? "";
  if (envBase) {
    return normalizeBaseUrl(envBase);
  }

  return "";
};

const API_BASE_URL = resolveBaseUrl();

export const apiUrl = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error('Paths passados para apiUrl devem começar com "/".');
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};
