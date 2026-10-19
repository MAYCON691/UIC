'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, errorMessage, formatBytes } from '@/lib/api';
import type { TeamUser } from '@/lib/types';
import {
  Avatar,
  btnGhost,
  btnPrimary,
  ConfirmModal,
  ErrorBox,
  inputCls,
  Modal,
  RoleBadge,
  Spinner,
} from '@/components/ui';

type EditableRole = 'ADMIN' | 'MONITORISTA';

function UserFormModal({
  target,
  onClose,
  onDone,
}: {
  target: TeamUser | null; // null = crear
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await api.patch(`/users/${target.id}`, {
          fullName: fullName.trim(),
          role,
          active,
          ...(password ? { password } : {}),
        });
      } else {
        await api.post('/users', { username: username.trim(), fullName: fullName.trim(), password, role });
      }
      await onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? `Editar a ${target.fullName}` : 'Crear usuario'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Nombre de usuario
          <input
            className={`${inputCls} mt-1`}
            value={username}
            disabled={editing}
            autoFocus={!editing}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: jperez"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Nombre completo
          <input
            className={`${inputCls} mt-1`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          {editing ? 'Nueva contraseña (déjala vacía para no cambiarla)' : 'Contraseña'}
          <input
            className={`${inputCls} mt-1`}
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
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
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Usuario activo (si lo desactivas ya no podrá ingresar)
          </label>
        )}
        {error && <ErrorBox message={error} />}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            type="submit"
            className={btnPrimary}
            disabled={
              busy ||
              !fullName.trim() ||
              (!editing && (!username.trim() || password.length < 6)) ||
              (editing && password.length > 0 && password.length < 6)
            }
          >
            {busy && <Spinner className="h-4 w-4 text-white" />}
            {editing ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<{ target: TeamUser | null } | null>(null);
  const [removing, setRemoving] = useState<TeamUser | null>(null);

  useEffect(() => {
    if (user && user.role !== 'SUPERADMIN') router.replace('/dashboard');
  }, [user, router]);

  const load = useCallback(async () => {
    try {
      const res = await api.get<TeamUser[]>('/users');
      setUsers(res.data);
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.role === 'SUPERADMIN') load();
  }, [user, load]);

  if (!user || user.role !== 'SUPERADMIN') return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">Crea administradores y monitoristas.</p>
        </div>
        <button className={btnPrimary} onClick={() => setForm({ target: null })}>
          <UserPlus className="h-4 w-4" />
          Crear usuario
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={u.fullName} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{u.fullName}</p>
                  <p className="truncate text-xs text-slate-500">
                    @{u.username} · {u._count.files} archivos · {formatBytes(u.storageBytes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={u.role} />
                {!u.active && (
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Inactivo
                  </span>
                )}
              </div>
              {u.role !== 'SUPERADMIN' ? (
                <div className="flex gap-1">
                  <button className={btnGhost} onClick={() => setForm({ target: u })} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className={`${btnGhost} text-red-600 hover:bg-red-50`}
                    onClick={() => setRemoving(u)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden w-[88px] sm:block" />
              )}
            </div>
          ))}
          {users.length <= 1 && (
            <p className="flex items-center gap-1.5 pt-2 text-sm text-slate-500">
              <Plus className="h-4 w-4" />
              Aún no has creado administradores ni monitoristas.
            </p>
          )}
        </div>
      )}

      {form && (
        <UserFormModal
          target={form.target}
          onClose={() => setForm(null)}
          onDone={async () => {
            await load();
            setForm(null);
          }}
        />
      )}

      {removing && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a ${removing.fullName}? Si ya subió archivos no se podrá eliminar: en ese caso desactívalo desde “Editar”.`}
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            await api.delete(`/users/${removing.id}`);
            await load();
            setRemoving(null);
          }}
        />
      )}
    </div>
  );
}