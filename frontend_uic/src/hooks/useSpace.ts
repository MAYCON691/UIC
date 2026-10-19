'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/http';
import type { Category, Channel, FileItem, FilesPage } from '@/lib/types';
import { channelsService, filesService, type UpdateFileInput } from '@/services';
import { INITIAL_QUERY, PAGE_LIMIT, SORTS } from '@/components/space/constants';
import type { Query } from '@/components/space/types';

/**
 * Toda la lógica del espacio de archivos de un usuario:
 * canales, categorías, lista filtrada y las acciones de crear / editar / borrar.
 */
export function useSpace(userId: number) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chLoading, setChLoading] = useState(true);
  const [q, setQ] = useState<Query>(INITIAL_QUERY);
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState<FilesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  const patch = (p: Partial<Query>) => setQ((prev) => ({ ...prev, page: 1, ...p }));
  const setPage = (page: number) => setQ((prev) => ({ ...prev, page }));

  const loadChannels = useCallback(async () => {
    try {
      setChannels(await channelsService.list(userId));
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
      const page = await filesService.list({
        userId,
        channelId: q.channelId ?? undefined,
        categoryId: q.categoryId ?? undefined,
        search: q.search || undefined,
        type: q.type || undefined,
        sortBy: s.sortBy,
        order: s.order,
        page: q.page,
        limit: PAGE_LIMIT,
      });
      if (id === reqId.current) {
        setData(page);
        setError('');
      }
    } catch (e) {
      if (id === reqId.current) setError(errorMessage(e));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [userId, q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const totalFiles = channels.reduce((sum, c) => sum + c._count.files, 0);

  // ── Acciones ──

  async function createChannel(name: string) {
    const created = await channelsService.create(name);
    await loadChannels();
    patch({ channelId: created.id, categoryId: null });
  }

  async function renameChannel(id: number, name: string) {
    await channelsService.rename(id, name);
    await refresh();
  }

  async function deleteChannel(channel: Channel) {
    await channelsService.remove(channel.id);
    if (q.channelId === channel.id) patch({ channelId: null, categoryId: null });
    await refresh();
  }

  async function createCategory(channel: Channel, name: string) {
    const created = await channelsService.createCategory(channel.id, name);
    await loadChannels();
    patch({ channelId: channel.id, categoryId: created.id });
  }

  async function renameCategory(id: number, name: string) {
    await channelsService.renameCategory(id, name);
    await refresh();
  }

  async function deleteCategory(category: Category) {
    await channelsService.removeCategory(category.id);
    if (q.categoryId === category.id) patch({ categoryId: null });
    await refresh();
  }

  async function saveFile(file: FileItem, values: UpdateFileInput) {
    await filesService.update(file.id, values);
    await refresh();
  }

  async function deleteFile(file: FileItem) {
    await filesService.remove(file.id);
    await refresh();
  }

  return {
    // estado
    channels,
    chLoading,
    q,
    searchInput,
    setSearchInput,
    data,
    loading,
    error,
    selectedChannel,
    selectedCategory,
    totalFiles,
    // filtros
    patch,
    setPage,
    refresh,
    // acciones
    createChannel,
    renameChannel,
    deleteChannel,
    createCategory,
    renameCategory,
    deleteCategory,
    saveFile,
    deleteFile,
  };
}
