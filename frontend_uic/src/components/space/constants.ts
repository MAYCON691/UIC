import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  type LucideIcon,
} from 'lucide-react';
import type { FileKind } from '@/lib/format';
import type { Query } from './types';

export const PAGE_LIMIT = 24;

export const INITIAL_QUERY: Query = {
  channelId: null,
  categoryId: null,
  search: '',
  type: '',
  sort: 'newest',
  page: 1,
};

export const KIND_STYLE: Record<FileKind, { icon: LucideIcon; color: string }> = {
  image: { icon: FileImage, color: 'bg-pink-400/15 text-pink-300' },
  video: { icon: FileVideo, color: 'bg-fuchsia-400/15 text-fuchsia-300' },
  audio: { icon: FileAudio, color: 'bg-amber-400/15 text-amber-300' },
  pdf: { icon: FileText, color: 'bg-red-500/10 text-red-300' },
  word: { icon: FileText, color: 'bg-sky-400/15 text-sky-300' },
  sheet: { icon: FileSpreadsheet, color: 'bg-emerald-400/15 text-emerald-300' },
  slides: { icon: Presentation, color: 'bg-orange-400/15 text-orange-300' },
  archive: { icon: FileArchive, color: 'bg-white/10 text-slate-300' },
  text: { icon: FileText, color: 'bg-white/10 text-slate-300' },
  other: { icon: FileIcon, color: 'bg-white/10 text-slate-300' },
};

export const SORTS: Record<string, { sortBy: string; order: string; label: string }> = {
  newest: { sortBy: 'createdAt', order: 'desc', label: 'Más recientes' },
  oldest: { sortBy: 'createdAt', order: 'asc', label: 'Más antiguos' },
  nameAsc: { sortBy: 'originalName', order: 'asc', label: 'Nombre A-Z' },
  nameDesc: { sortBy: 'originalName', order: 'desc', label: 'Nombre Z-A' },
  sizeDesc: { sortBy: 'size', order: 'desc', label: 'Más pesados' },
  sizeAsc: { sortBy: 'size', order: 'asc', label: 'Más livianos' },
};

export const TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Documentos' },
  { value: 'audio', label: 'Audios' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Imágenes' },
];
