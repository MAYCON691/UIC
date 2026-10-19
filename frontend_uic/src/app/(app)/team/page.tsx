'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/http';
import type { TeamUser } from '@/lib/types';
import { usersService } from '@/services';
import { ErrorBox, inputCls, Spinner } from '@/components/ui';
import UserCard from '@/components/team/UserCard';

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role === 'MONITORISTA') router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role === 'MONITORISTA') return;
    usersService
      .list()
      .then(setUsers)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role === 'MONITORISTA') return null;

  const term = search.trim().toLowerCase();
  const visible = users.filter(
    (u) =>
      !term || u.fullName.toLowerCase().includes(term) || u.username.toLowerCase().includes(term),
  );

  return (
    <div className="page-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Equipo</h1>
        <p className="mt-1 text-sm text-slate-400">
          Entra al espacio de cada persona para ver y descargar sus archivos.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Buscar persona…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorBox message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((u, i) => (
            <UserCard key={u.id} user={u} index={i} isMe={u.id === user.id} />
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-slate-400">No se encontró a nadie con ese nombre.</p>
          )}
        </div>
      )}
    </div>
  );
}
