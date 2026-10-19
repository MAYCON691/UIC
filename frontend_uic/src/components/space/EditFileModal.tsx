'use client';

import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/http';
import type { Channel, FileItem } from '@/lib/types';
import { btnGhost, btnPrimary, ErrorBox, inputCls, Modal, Spinner } from '@/components/ui';

/** Ventana para cambiar nombre, canal y categoría de un archivo. */
export default function EditFileModal({
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
        <label className="block text-sm font-medium text-slate-200">
          Nombre
          <input
            autoFocus
            className={`${inputCls} mt-1`}
            value={name}
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
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
        <label className="block text-sm font-medium text-slate-200">
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
