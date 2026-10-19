'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, FolderOpen, HardDrive, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, errorMessage, formatBytes } from '@/lib/api';
import type { TeamUser } from '@/lib/types';
import { Avatar, ErrorBox, inputCls, RoleBadge, Spinner } from '@/components/ui';

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
    api
      .get<TeamUser[]>('/users')
      .then((res) => setUsers(res.data))
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
            <Link
              key={u.id}
              style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
              href={u.id === user.id ? '/dashboard' : `/team/${u.id}`}
              className="hud rise border border-white/10 glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.28)]"
            >
              <div className="flex items-center gap-3">
                <Avatar name={u.fullName} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {u.fullName}
                    {u.id === user.id && <span className="ml-1 text-xs font-normal text-slate-400">(tú)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-400">@{u.username}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <RoleBadge role={u.role} />
                {!u.active && (
                  <span className="bg-white/15 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center text-xs text-slate-400">
                <div>
                  <FolderOpen className="mx-auto h-4 w-4 text-slate-400" />
                  <p className="mt-1 font-semibold text-slate-100">{u._count.channels}</p>
                  canales
                </div>
                <div>
                  <FileText className="mx-auto h-4 w-4 text-slate-400" />
                  <p className="mt-1 font-semibold text-slate-100">{u._count.files}</p>
                  archivos
                </div>
                <div>
                  <HardDrive className="mx-auto h-4 w-4 text-slate-400" />
                  <p className="mt-1 font-semibold text-slate-100">{formatBytes(u.storageBytes)}</p>
                  espacio
                </div>
              </div>
            </Link>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-slate-400">No se encontró a nadie con ese nombre.</p>
          )}
        </div>
      )}
    </div>
  );
}