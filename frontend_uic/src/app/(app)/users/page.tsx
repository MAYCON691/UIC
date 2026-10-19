'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/http';
import type { TeamUser } from '@/lib/types';
import { usersService } from '@/services';
import { btnPrimary, ConfirmModal, ErrorBox, Spinner } from '@/components/ui';
import UserFormModal from '@/components/users/UserFormModal';
import UserRow from '@/components/users/UserRow';

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
      setUsers(await usersService.list());
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
    <div className="page-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-400">Crea administradores y monitoristas.</p>
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
          {users.map((u, i) => (
            <UserRow
              key={u.id}
              user={u}
              index={i}
              onEdit={() => setForm({ target: u })}
              onDelete={() => setRemoving(u)}
            />
          ))}
          {users.length <= 1 && (
            <p className="flex items-center gap-1.5 pt-2 text-sm text-slate-400">
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
            await usersService.remove(removing.id);
            await load();
            setRemoving(null);
          }}
        />
      )}
    </div>
  );
}
