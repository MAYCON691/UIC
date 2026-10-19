'use client';

import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/http';
import { btnGhost, btnPrimary, ErrorBox, inputCls, Modal, Spinner } from '@/components/ui';

/** Ventana para escribir un nombre (crear o renombrar canal / categoría). */
export default function NameModal({
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
        <label className="block text-sm font-medium text-slate-200">
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
