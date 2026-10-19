'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/http';
import { formatBytes } from '@/lib/format';
import type { TeamUser } from '@/lib/types';
import { Avatar, ErrorBox, RoleBadge, Spinner } from '@/components/ui';
import { usersService } from '@/services';
import SpaceView from '@/components/space/SpaceView';

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
    usersService
      .get(id)
      .then(setTarget)
      .catch((e) => setError(errorMessage(e)));
  }, [user, id]);

  if (!user || user.role === 'MONITORISTA') return null;

  return (
    <div className="page-in space-y-6">
      <Link
        href="/team"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al equipo
      </Link>

      {error && <ErrorBox message={error} />}
      {!target && !error && <Spinner />}

      {target && (
        <>
          <div className="hud flex items-center gap-4 border border-white/10 glass p-5">
            <Avatar name={target.fullName} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-white">{target.fullName}</p>
              <p className="text-sm text-slate-400">@{target.username}</p>
            </div>
            <div className="hidden text-right text-sm text-slate-400 sm:block">
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
