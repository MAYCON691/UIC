'use client';

import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/http';
import { PASSWORD_MAX, PASSWORD_MIN } from '@/lib/rules';
import type { TeamUser } from '@/lib/types';
import { usersService, type EditableRole } from '@/services';
import { btnGhost, btnPrimary, ErrorBox, inputCls, Modal, Spinner } from '@/components/ui';

/** Crear (target = null) o editar un usuario. */
export default function UserFormModal({
  target,
  onClose,
  onDone,
}: {
  target: TeamUser | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const editing = !!target;
  const [username, setUsername] = useState(target?.username ?? '');
  const [fullName, setFullName] = useState(target?.fullName ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<EditableRole>(
    target && target.role !== 'SUPERADMIN' ? target.role : 'MONITORISTA',
  );
  const [active, setActive] = useState(target?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const passwordTooShort = password.length > 0 && password.length < PASSWORD_MIN;
  const invalid =
    !fullName.trim() ||
    (!editing && (!username.trim() || password.length < PASSWORD_MIN)) ||
    (editing && passwordTooShort);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (target) {
        await usersService.update(target.id, {
          fullName: fullName.trim(),
          role,
          active,
          ...(password ? { password } : {}),
        });
      } else {
        await usersService.create({ username: username.trim(), fullName: fullName.trim(), password, role });
      }
      await onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={target ? `Editar a ${target.fullName}` : 'Crear usuario'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Nombre de usuario
          <input
            className={`${inputCls} mt-1`}
            value={username}
            disabled={editing}
            autoFocus={!editing}
            maxLength={40}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: jperez"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Nombre completo
          <input
            className={`${inputCls} mt-1`}
            value={fullName}
            maxLength={80}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          {editing ? 'Nueva contraseña (déjala vacía para no cambiarla)' : 'Contraseña'}
          <input
            className={`${inputCls} mt-1`}
            type="password"
            value={password}
            maxLength={PASSWORD_MAX}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Rol
          <select
            className={`${inputCls} mt-1`}
            value={role}
            onChange={(e) => setRole(e.target.value as EditableRole)}
          >
            <option value="MONITORISTA">Monitorista (solo su propio espacio)</option>
            <option value="ADMIN">Administrador (ve y descarga todo)</option>
          </select>
        </label>
        {editing && (
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Usuario activo (si lo desactivas ya no podrá ingresar)
          </label>
        )}
        {error && <ErrorBox message={error} />}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className={btnPrimary} disabled={busy || invalid}>
            {busy && <Spinner className="h-4 w-4 text-white" />}
            {editing ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
