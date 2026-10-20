import { api, API_URL } from '@/lib/http';
import type { FilesPage } from '@/lib/types';

export interface FilesParams {
  userId: number;
  channelId?: number;
  categoryId?: number;
  search?: string;
  type?: string;
  sortBy: string;
  order: string;
  page: number;
  limit: number;
}

export interface UpdateFileInput {
  originalName: string;
  channelId: number;
  categoryId: number;
}

/**
 * Pide un "ticket" de corta duración para UN archivo y arma la URL.
 * Así el token de sesión nunca viaja en la dirección del archivo.
 */
async function ticketUrl(id: number, inline = false): Promise<string> {
  const { data } = await api.post<{ ticket: string }>(`/files/${id}/ticket`);
  const query = new URLSearchParams({ ticket: data.ticket });
  if (inline) query.set('inline', '1');
  return `${API_URL}/files/${id}/download?${query.toString()}`;
}

export const filesService = {
  list: (params: FilesParams) => api.get<FilesPage>('/files', { params }).then((r) => r.data),

  /** `onProgress` recibe el porcentaje (0-100) de la subida. */
  upload: (form: FormData, onProgress: (pct: number) => void) =>
    api.post('/files', form, {
      onUploadProgress: (ev) => onProgress(ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0),
    }),

  update: (id: number, input: UpdateFileInput) => api.patch(`/files/${id}`, input).then((r) => r.data),

  remove: (id: number) => api.delete(`/files/${id}`).then((r) => r.data),

  ticketUrl,

  /** Trae el archivo completo a memoria (para los visores de Word, Excel, PowerPoint y texto). */
  async fetchBuffer(id: number): Promise<ArrayBuffer> {
    const res = await fetch(await ticketUrl(id, true));
    if (!res.ok) throw new Error('No se pudo cargar el archivo.');
    return res.arrayBuffer();
  },

  /** Inicia la descarga del archivo en el navegador. */
  async download(id: number) {
    window.location.assign(await ticketUrl(id));
  },
};