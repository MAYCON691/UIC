import type { Category, Channel, FileItem } from '@/lib/types';

/** Filtros y página actual de la lista de archivos. */
export interface Query {
  channelId: number | null;
  categoryId: number | null;
  search: string;
  type: string;
  sort: string;
  page: number;
}

/** Un archivo en la cola de subida. */
export interface UploadItem {
  id: number;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

/** Ventana abierta en este momento (o null). */
export type ModalState =
  | null
  | { kind: 'newChannel' }
  | { kind: 'renameChannel'; channel: Channel }
  | { kind: 'deleteChannel'; channel: Channel }
  | { kind: 'newCategory'; channel: Channel }
  | { kind: 'renameCategory'; category: Category }
  | { kind: 'deleteCategory'; category: Category }
  | { kind: 'editFile'; file: FileItem }
  | { kind: 'deleteFile'; file: FileItem }
  | { kind: 'preview'; file: FileItem };
