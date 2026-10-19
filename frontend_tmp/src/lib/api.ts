import axios from 'axios';

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

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignorar */
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'No se pudo conectar con el servidor';
    const msg = e.response.data?.message;
    if (Array.isArray(msg)) return msg.join('. ');
    if (typeof msg === 'string') return msg;
  }
  return 'Ocurrió un error inesperado';
}

/** URL directa del archivo (el token va en la URL para poder usarla en <video>, <img>, etc.) */
export function fileUrl(id: number, inline = false): string {
  const token = encodeURIComponent(getToken());
  return `${API_URL}/files/${id}/download?${inline ? 'inline=1&' : ''}token=${token}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
}

export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'sheet'
  | 'slides'
  | 'archive'
  | 'text'
  | 'other';

export function fileKind(mime: string, name = ''): FileKind {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m === 'application/pdf') return 'pdf';
  if (m.includes('word') || /\.(docx?|odt|rtf)$/.test(n)) return 'word';
  if (m.includes('excel') || m.includes('spreadsheet') || /\.(xlsx?|csv|ods)$/.test(n)) return 'sheet';
  if (m.includes('powerpoint') || m.includes('presentation') || /\.(pptx?|odp)$/.test(n)) return 'slides';
  if (
    m.includes('zip') ||
    m.includes('rar') ||
    m.includes('compressed') ||
    m.includes('tar') ||
    /\.(zip|rar|7z|tar|gz)$/.test(n)
  )
    return 'archive';
  if (m.startsWith('text/')) return 'text';
  return 'other';
}