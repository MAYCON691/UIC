'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { errorMessage } from '@/lib/api';
import type { Role } from '@/lib/types';

/* Los estilos viven en src/styles/components.css; aquí solo se nombran las clases. */

export const inputCls = 'input';
export const btnPrimary = 'btn btn-primary';
export const btnGhost = 'btn btn-ghost';
export const btnDanger = 'btn btn-danger';

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Administrador',
  MONITORISTA: 'Monitorista',
};

const ROLE_BADGE: Record<Role, string> = {
  SUPERADMIN: 'badge--superadmin',
  ADMIN: 'badge--admin',
  MONITORISTA: 'badge--monitorista',
};

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge ${ROLE_BADGE[role]}`}>{ROLE_LABEL[role]}</span>;
}

export function Spinner({ className = 'h-6 w-6 text-cyan-300' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function FullSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-9 w-9 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="alert-error shake">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '?';
  return (
    <div style={{ width: size, height: size }} className="avatar">
      {initials}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay fade-in" onMouseDown={onClose}>
      <div
        className={`modal-panel ${wide ? 'modal-panel--wide' : ''} glass-strong hud pop-in`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="scan-bar" />
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

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