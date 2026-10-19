'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, errorMessage, formatBytes } from '@/lib/api';
import type { TeamUser } from '@/lib/types';
import { Avatar, ErrorBox, RoleBadge, Spinner } from '@/components/ui';
import SpaceView from '@/components/SpaceView';

export default function UserSpacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [target, setTarget] = useState<TeamUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'MONITORISTA') router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role === 'MONITORISTA' || !Number.isInteger(id)) return;
    api
      .get<TeamUser>(`/users/${id}`)
      .then((res) => setTarget(res.data))
      .catch((e) => setError(errorMessage(e)));
  }, [user, id]);

  if (!user || user.role === 'MONITORISTA') return null;

  return (
    <div className="space-y-6">
      <Link
        href="/team"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al equipo
      </Link>

      {error && <ErrorBox message={error} />}
      {!target && !error && <Spinner />}

      {target && (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <Avatar name={target.fullName} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-slate-900">{target.fullName}</p>
              <p className="text-sm text-slate-500">@{target.username}</p>
            </div>
            <div className="hidden text-right text-sm text-slate-500 sm:block">
              <p>
                {target._count.files} archivos · {formatBytes(target.storageBytes)}
              </p>
              <div className="mt-1">
                <RoleBadge role={target.role} />
              </div>
            </div>
          </div>

          <SpaceView
            key={target.id}
            userId={target.id}
            readOnly={target.id !== user.id}
            title={`Espacio de ${target.fullName}`}
          />
        </>
      )}
    </div>
  );
}