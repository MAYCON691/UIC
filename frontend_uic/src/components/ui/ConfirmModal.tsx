'use client';

import { useState } from 'react';
import { errorMessage } from '@/lib/http';
import { btnDanger, btnGhost } from './classes';
import { ErrorBox } from './ErrorBox';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Eliminar',
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="modal-text">{message}</p>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button className={btnGhost} onClick={onClose} disabled={busy}>
          Cancelar
        </button>
        <button className={btnDanger} onClick={run} disabled={busy}>
          {busy && <Spinner className="h-4 w-4 text-white" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
