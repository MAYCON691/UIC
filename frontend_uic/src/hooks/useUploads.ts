'use client';

import { useState } from 'react';
import { errorMessage } from '@/lib/http';
import { filesService } from '@/services';
import type { UploadItem } from '@/components/space/types';

/** Cola de subidas: envía los archivos de uno en uno y muestra el avance. */
export function useUploads(onFinished: () => Promise<void> | void) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const update = (id: number, changes: Partial<UploadItem>) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)));

  async function upload(list: File[], channelId: number, categoryId: number) {
    if (list.length === 0) return;
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
        await filesService.upload(form, (pct) => update(uid, { progress: pct }));
        update(uid, { progress: 100, status: 'done' });
      } catch (e) {
        update(uid, { status: 'error', error: errorMessage(e) });
      }
    }
    await onFinished();
  }

  const clearFinished = () => setUploads((prev) => prev.filter((u) => u.status === 'uploading'));

  return { uploads, upload, clearFinished };
}
