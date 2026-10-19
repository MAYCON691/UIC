'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FolderOpen,
  Pencil,
  Plus,
  Presentation,
  Search,
  Trash2,
  UploadCloud,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  api,
  errorMessage,
  fileKind,
  fileUrl,
  formatBytes,
  formatDate,
  type FileKind,
} from '@/lib/api';
import type { Category, Channel, FileItem, FilesPage } from '@/lib/types';
import {
  btnGhost,
  btnPrimary,
  ConfirmModal,
  ErrorBox,
  inputCls,
  Modal,
  Spinner,
} from './ui';

// ───────────────────────── Constantes ─────────────────────────

const KIND_STYLE: Record<FileKind, { icon: LucideIcon; color: string }> = {
  image: { icon: FileImage, color: 'bg-pink-50 text-pink-600' },
  video: { icon: FileVideo, color: 'bg-purple-50 text-purple-600' },
  audio: { icon: FileAudio, color: 'bg-amber-50 text-amber-600' },
  pdf: { icon: FileText, color: 'bg-red-50 text-red-600' },
  word: { icon: FileText, color: 'bg-blue-50 text-blue-600' },
  sheet: { icon: FileSpreadsheet, color: 'bg-emerald-50 text-emerald-600' },
  slides: { icon: Presentation, color: 'bg-orange-50 text-orange-600' },
  archive: { icon: FileArchive, color: 'bg-slate-100 text-slate-600' },
  text: { icon: FileText, color: 'bg-slate-100 text-slate-600' },
  other: { icon: FileIcon, color: 'bg-slate-100 text-slate-600' },
};

const SORTS: Record<string, { sortBy: string; order: string; label: string }> = {
  newest: { sortBy: 'createdAt', order: 'desc', label: 'Más recientes' },
  oldest: { sortBy: 'createdAt', order: 'asc', label: 'Más antiguos' },
  nameAsc: { sortBy: 'originalName', order: 'asc', label: 'Nombre A-Z' },
  nameDesc: { sortBy: 'originalName', order: 'desc', label: 'Nombre Z-A' },
  sizeDesc: { sortBy: 'size', order: 'desc', label: 'Más pesados' },
  sizeAsc: { sortBy: 'size', order: 'asc', label: 'Más livianos' },
};

const TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Documentos' },
  { value: 'audio', label: 'Audios' },
  { value: 'video', label: 'Videos' },
  { value: 'image', label: 'Imágenes' },
];

interface Query {
  channelId: number | null;
  categoryId: number | null;
  search: string;
  type: string;
  sort: string;
  page: number;
}

interface UploadItem {
  id: number;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

type ModalState =
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

// ───────────────────────── Modales ─────────────────────────

function NameModal({
  title,
  label,
  placeholder,
  initial = '',
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  placeholder?: string;
  initial?: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          {label}
          <input
            autoFocus
            className={`${inputCls} mt-1`}
            value={name}
            maxLength={60}
            placeholder={placeholder}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {error && <ErrorBox message={error} />}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className={btnPrimary} disabled={busy || !name.trim()}>
            {busy && <Spinner className="h-4 w-4 text-white" />}
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditFileModal({
  file,
  channels,
  onClose,
  onSave,
}: {
  file: FileItem;
  channels: Channel[];
  onClose: () => void;
  onSave: (data: { originalName: string; channelId: number; categoryId: number }) => Promise<void>;
}) {
  const [name, setName] = useState(file.originalName);
  const [channelId, setChannelId] = useState(file.channelId);
  const [categoryId, setCategoryId] = useState(file.categoryId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const categories = channels.find((c) => c.id === channelId)?.categories ?? [];

  function changeChannel(id: number) {
    setChannelId(id);
    const first = channels.find((c) => c.id === id)?.categories[0];
    setCategoryId(first ? first.id : 0);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    setBusy(true);
    setError('');
    try {
      await onSave({ originalName: name.trim(), channelId, categoryId });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title="Editar archivo" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Nombre
          <input
            autoFocus
            className={`${inputCls} mt-1`}
            value={name}
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Canal
          <select
            className={`${inputCls} mt-1`}
            value={channelId}
            onChange={(e) => changeChannel(Number(e.target.value))}
          >
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Categoría
          <select
            className={`${inputCls} mt-1`}
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categories.length === 0 && <option value={0}>Este canal no tiene categorías</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {error && <ErrorBox message={error} />}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className={btnPrimary} disabled={busy || !name.trim() || !categoryId}>
            {busy && <Spinner className="h-4 w-4 text-white" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PreviewModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const kind = fileKind(file.mimeType, file.originalName);
  const url = fileUrl(file.id, true);

  return (
    <Modal title={file.originalName} onClose={onClose} wide>
      <div className="flex min-h-[200px] items-center justify-center">
        {kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.originalName} className="max-h-[70vh] max-w-full rounded-lg" />
        )}
        {kind === 'video' && (
          <video src={url} controls autoPlay className="max-h-[70vh] w-full rounded-lg bg-black" />
        )}
        {kind === 'audio' && <audio src={url} controls autoPlay className="w-full" />}
        {kind === 'pdf' && (
          <iframe src={url} title={file.originalName} className="h-[70vh] w-full rounded-lg border" />
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <a href={fileUrl(file.id)} className={btnPrimary}>
          <Download className="h-4 w-4" />
          Descargar
        </a>
      </div>
    </Modal>
  );
}

// ───────────────────────── Fila de archivo ─────────────────────────

function FileRow({
  file,
  readOnly,
  onPreview,
  onEdit,
  onDelete,
}: {
  file: FileItem;
  readOnly: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const kind = fileKind(file.mimeType, file.originalName);
  const { icon: Icon, color } = KIND_STYLE[kind];
  const canPreview = kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'pdf';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {formatBytes(file.size)} · {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:w-56 sm:justify-end">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {file.channel.name}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {file.category.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {canPreview && (
          <button className={btnGhost} onClick={onPreview} title="Ver">
            <Eye className="h-4 w-4" />
          </button>
        )}
        <a href={fileUrl(file.id)} className={btnGhost} title="Descargar">
          <Download className="h-4 w-4" />
        </a>
        {!readOnly && (
          <>
            <button className={btnGhost} onClick={onEdit} title="Editar">
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className={`${btnGhost} text-red-600 hover:bg-red-50`}
              onClick={onDelete}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Vista principal ─────────────────────────

export default function SpaceView({
  userId,
  readOnly,
  title,
}: {
  userId: number;
  readOnly: boolean;
  title: string;
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chLoading, setChLoading] = useState(true);
  const [q, setQ] = useState<Query>({
    channelId: null,
    categoryId: null,
    search: '',
    type: '',
    sort: 'newest',
    page: 1,
  });
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState<FilesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const reqId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<Query>) => setQ((prev) => ({ ...prev, page: 1, ...p }));

  const loadChannels = useCallback(async () => {
    try {
      const res = await api.get<Channel[]>('/channels', { params: { userId } });
      setChannels(res.data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setChLoading(false);
    }
  }, [userId]);

  const loadFiles = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const s = SORTS[q.sort];
      const res = await api.get<FilesPage>('/files', {
        params: {
          userId,
          channelId: q.channelId ?? undefined,
          categoryId: q.categoryId ?? undefined,
          search: q.search || undefined,
          type: q.type || undefined,
          sortBy: s.sortBy,
          order: s.order,
          page: q.page,
          limit: 24,
        },
      });
      if (id === reqId.current) {
        setData(res.data);
        setError('');
      }
    } catch (e) {
      if (id === reqId.current) setError(errorMessage(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [userId, q]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // búsqueda con retardo para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => {
      const value = searchInput.trim();
      setQ((prev) => (prev.search === value ? prev : { ...prev, search: value, page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const refresh = async () => {
    await Promise.all([loadChannels(), loadFiles()]);
  };

  const selectedChannel = channels.find((c) => c.id === q.channelId) ?? null;
  const selectedCategory = selectedChannel?.categories.find((c) => c.id === q.categoryId) ?? null;
  const canUpload = !readOnly && !!selectedChannel && !!selectedCategory;
  const totalFiles = channels.reduce((sum, c) => sum + c._count.files, 0);

  // ── Acciones ──

  async function createChannel(name: string) {
    const res = await api.post<Channel>('/channels', { name });
    await loadChannels();
    patch({ channelId: res.data.id, categoryId: null });
    setModal(null);
  }

  async function renameChannel(id: number, name: string) {
    await api.patch(`/channels/${id}`, { name });
    await refresh();
    setModal(null);
  }

  async function deleteChannel(channel: Channel) {
    await api.delete(`/channels/${channel.id}`);
    if (q.channelId === channel.id) patch({ channelId: null, categoryId: null });
    await refresh();
    setModal(null);
  }

  async function createCategory(channel: Channel, name: string) {
    const res = await api.post<Category>(`/channels/${channel.id}/categories`, { name });
    await loadChannels();
    patch({ channelId: channel.id, categoryId: res.data.id });
    setModal(null);
  }

  async function renameCategory(id: number, name: string) {
    await api.patch(`/categories/${id}`, { name });
    await refresh();
    setModal(null);
  }

  async function deleteCategory(category: Category) {
    await api.delete(`/categories/${category.id}`);
    if (q.categoryId === category.id) patch({ categoryId: null });
    await refresh();
    setModal(null);
  }

  async function saveFile(
    file: FileItem,
    values: { originalName: string; channelId: number; categoryId: number },
  ) {
    await api.patch(`/files/${file.id}`, values);
    await refresh();
    setModal(null);
  }

  async function deleteFile(file: FileItem) {
    await api.delete(`/files/${file.id}`);
    await refresh();
    setModal(null);
  }

  async function uploadFiles(list: File[]) {
    if (!selectedChannel || !selectedCategory || list.length === 0) return;
    const channelId = selectedChannel.id;
    const categoryId = selectedCategory.id;
    const base = Date.now();
    const items: UploadItem[] = list.map((f, i) => ({
      id: base + i,
      name: f.name,
      progress: 0,
      status: 'uploading',
    }));
    setUploads((prev) => [...items, ...prev].slice(0, 10));

    for (let i = 0; i < list.length; i++) {
      const uid = items[i].id;
      const form = new FormData();
      form.append('channelId', String(channelId));
      form.append('categoryId', String(categoryId));
      form.append('file', list[i]);
      try {
        await api.post('/files', form, {
          onUploadProgress: (ev) => {
            const pct = ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0;
            setUploads((prev) => prev.map((u) => (u.id === uid ? { ...u, progress: pct } : u)));
          },
        });
        setUploads((prev) =>
          prev.map((u) => (u.id === uid ? { ...u, progress: 100, status: 'done' } : u)),
        );
      } catch (e) {
        setUploads((prev) =>
          prev.map((u) => (u.id === uid ? { ...u, status: 'error', error: errorMessage(e) } : u)),
        );
      }
    }
    await refresh();
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {readOnly && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Eye className="h-4 w-4" />
            Modo consulta: puedes ver y descargar, pero no modificar.
          </p>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      {/* Canales */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Canales</h2>
          {!readOnly && (
            <button className={btnPrimary} onClick={() => setModal({ kind: 'newChannel' })}>
              <Plus className="h-4 w-4" />
              Añadir canal
            </button>
          )}
        </div>

        {chLoading ? (
          <Spinner />
        ) : channels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {readOnly
              ? 'Este usuario todavía no tiene canales.'
              : 'Aún no tienes canales. Crea el primero (por ejemplo ATB o Red Uno) con “Añadir canal”.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => patch({ channelId: null, categoryId: null })}
              onKeyDown={(e) => e.key === 'Enter' && patch({ channelId: null, categoryId: null })}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                q.channelId === null
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white">
                <FolderOpen className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">Todos los canales</p>
              <p className="text-xs text-slate-500">{totalFiles} archivos</p>
            </div>

            {channels.map((c) => {
              const active = q.channelId === c.id;
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => patch({ channelId: c.id, categoryId: null })}
                  onKeyDown={(e) => e.key === 'Enter' && patch({ channelId: c.id, categoryId: null })}
                  className={`group cursor-pointer rounded-2xl border p-4 transition ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    {!readOnly && (
                      <div className="flex gap-1 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          title="Renombrar canal"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ kind: 'renameChannel', channel: c });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Eliminar canal"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ kind: 'deleteChannel', channel: c });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 truncate font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c._count.files} archivos · {c.categories.length} categorías
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Categorías del canal elegido */}
      {selectedChannel && (
        <section className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Categorías
          </span>
          <button
            onClick={() => patch({ categoryId: null })}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              q.categoryId === null
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            Todas ({selectedChannel._count.files})
          </button>
          {selectedChannel.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => patch({ categoryId: cat.id })}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                q.categoryId === cat.id
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
              }`}
            >
              {cat.name} ({cat._count.files})
            </button>
          ))}
          {!readOnly && (
            <button
              onClick={() => setModal({ kind: 'newCategory', channel: selectedChannel })}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
            >
              <Plus className="h-3.5 w-3.5" />
              Categoría
            </button>
          )}
          {!readOnly && selectedCategory && (
            <span className="ml-1 flex gap-1">
              <button
                title="Renombrar categoría"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                onClick={() => setModal({ kind: 'renameCategory', category: selectedCategory })}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                title="Eliminar categoría"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                onClick={() => setModal({ kind: 'deleteCategory', category: selectedCategory })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          )}
        </section>
      )}

      {/* Zona de subida */}
      {!readOnly && (
        <section className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (canUpload) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (canUpload) uploadFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => canUpload && fileInput.current?.click()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
              canUpload
                ? dragOver
                  ? 'cursor-pointer border-indigo-500 bg-indigo-50'
                  : 'cursor-pointer border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                : 'cursor-not-allowed border-slate-200 bg-slate-50'
            }`}
          >
            <UploadCloud className={`h-10 w-10 ${canUpload ? 'text-indigo-500' : 'text-slate-300'}`} />
            <p className={`mt-2 font-medium ${canUpload ? 'text-slate-800' : 'text-slate-400'}`}>
              Jala tus archivos aquí o haz clic para elegirlos
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {canUpload
                ? `Se guardarán en ${selectedChannel!.name} › ${selectedCategory!.name}`
                : !selectedChannel
                  ? 'Primero elige un canal.'
                  : 'Ahora elige (o crea) una categoría dentro del canal.'}
            </p>
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                e.target.value = '';
                uploadFiles(list);
              }}
            />
          </div>

          {uploads.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Subidas</p>
                <button
                  className="text-xs text-slate-500 hover:text-slate-800"
                  onClick={() => setUploads((prev) => prev.filter((u) => u.status === 'uploading'))}
                >
                  Limpiar lista
                </button>
              </div>
              {uploads.map((u) => (
                <div key={u.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    {u.status === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    {u.status === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                    {u.status === 'uploading' && <Spinner className="h-4 w-4 shrink-0 text-indigo-600" />}
                    <span className="truncate text-slate-800">{u.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-slate-500">
                      {u.status === 'uploading' ? `${u.progress}%` : u.status === 'done' ? 'Listo' : 'Error'}
                    </span>
                  </div>
                  {u.status === 'uploading' && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  )}
                  {u.status === 'error' && <p className="mt-0.5 text-xs text-red-600">{u.error}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filtros */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Buscar por nombre…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className={`${inputCls} sm:w-44`}
          value={q.type}
          onChange={(e) => patch({ type: e.target.value })}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={`${inputCls} sm:w-44`}
          value={q.sort}
          onChange={(e) => patch({ sort: e.target.value })}
        >
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </section>

      {/* Archivos */}
      <section>
        <p className="mb-2 text-sm text-slate-500">
          {data ? `${data.total} archivo${data.total === 1 ? '' : 's'}` : ''}
        </p>

        {loading && !data ? (
          <Spinner />
        ) : data && data.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No hay archivos con estos filtros.
          </div>
        ) : (
          <div className={`space-y-2 transition ${loading ? 'opacity-60' : ''}`}>
            {data?.items.map((f) => (
              <FileRow
                key={f.id}
                file={f}
                readOnly={readOnly}
                onPreview={() => setModal({ kind: 'preview', file: f })}
                onEdit={() => setModal({ kind: 'editFile', file: f })}
                onDelete={() => setModal({ kind: 'deleteFile', file: f })}
              />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              className={btnGhost}
              disabled={q.page <= 1}
              onClick={() => setQ((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <span className="text-sm text-slate-600">
              Página {data.page} de {data.totalPages}
            </span>
            <button
              className={btnGhost}
              disabled={q.page >= data.totalPages}
              onClick={() => setQ((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Modales */}
      {modal?.kind === 'newChannel' && (
        <NameModal
          title="Añadir canal"
          label="Nombre del canal"
          placeholder="Ej: ATB, Red Uno, Bolivisión…"
          submitLabel="Crear canal"
          onClose={() => setModal(null)}
          onSubmit={createChannel}
        />
      )}
      {modal?.kind === 'renameChannel' && (
        <NameModal
          title="Renombrar canal"
          label="Nombre del canal"
          initial={modal.channel.name}
          submitLabel="Guardar"
          onClose={() => setModal(null)}
          onSubmit={(name) => renameChannel(modal.channel.id, name)}
        />
      )}
      {modal?.kind === 'deleteChannel' && (
        <ConfirmModal
          title="Eliminar canal"
          message={`Se eliminará el canal “${modal.channel.name}” con sus categorías y los ${modal.channel._count.files} archivos que contiene. Esta acción no se puede deshacer.`}
          onClose={() => setModal(null)}
          onConfirm={() => deleteChannel(modal.channel)}
        />
      )}
      {modal?.kind === 'newCategory' && (
        <NameModal
          title={`Nueva categoría en ${modal.channel.name}`}
          label="Nombre de la categoría"
          placeholder="Ej: Videos, Audios, PDF…"
          submitLabel="Crear categoría"
          onClose={() => setModal(null)}
          onSubmit={(name) => createCategory(modal.channel, name)}
        />
      )}
      {modal?.kind === 'renameCategory' && (
        <NameModal
          title="Renombrar categoría"
          label="Nombre de la categoría"
          initial={modal.category.name}
          submitLabel="Guardar"
          onClose={() => setModal(null)}
          onSubmit={(name) => renameCategory(modal.category.id, name)}
        />
      )}
      {modal?.kind === 'deleteCategory' && (
        <ConfirmModal
          title="Eliminar categoría"
          message={`Se eliminará la categoría “${modal.category.name}” y los ${modal.category._count.files} archivos que contiene. Esta acción no se puede deshacer.`}
          onClose={() => setModal(null)}
          onConfirm={() => deleteCategory(modal.category)}
        />
      )}
      {modal?.kind === 'editFile' && (
        <EditFileModal
          file={modal.file}
          channels={channels}
          onClose={() => setModal(null)}
          onSave={(values) => saveFile(modal.file, values)}
        />
      )}
      {modal?.kind === 'deleteFile' && (
        <ConfirmModal
          title="Eliminar archivo"
          message={`¿Eliminar “${modal.file.originalName}”? Esta acción no se puede deshacer.`}
          onClose={() => setModal(null)}
          onConfirm={() => deleteFile(modal.file)}
        />
      )}
      {modal?.kind === 'preview' && <PreviewModal file={modal.file} onClose={() => setModal(null)} />}
    </div>
  );
}