import axios from 'axios';

/* Cliente HTTP único del sistema: URL base, token de sesión y manejo de errores. */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const TOKEN_KEY = 'uic_token';

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignorar: navegación privada */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignorar */
  }
}

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sesión vencida o inválida: se limpia el token y se vuelve al login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/** Convierte cualquier error en un mensaje legible para el usuario. */
export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'No se pudo conectar con el servidor';
    if (e.response.status === 429) return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo';
    const msg = e.response.data?.message;
    if (Array.isArray(msg)) return msg.join('. ');
    if (typeof msg === 'string') return msg;
  }
  return 'Ocurrió un error inesperado';
}
