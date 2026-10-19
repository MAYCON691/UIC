'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { formatBytes } from '@/lib/format';
import type { TeamUser } from '@/lib/types';
import { Avatar, btnGhost, RoleBadge } from '@/components/ui';

/** Una fila de la tabla de administración de usuarios. */
export default function UserRow({
  user,
  index,
  onEdit,
  onDelete,
}: {
  user: TeamUser;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
      className="rise flex flex-col gap-3 border border-white/10 glass p-4 transition-all duration-300 hover:border-cyan-400/30 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={user.fullName} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.fullName}</p>
          <p className="truncate text-xs text-slate-400">
            @{user.username} · {user._count.files} archivos · {formatBytes(user.storageBytes)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RoleBadge role={user.role} />
        {!user.active && (
          <span className="bg-white/15 px-2.5 py-0.5 text-xs font-medium text-slate-300">Inactivo</span>
        )}
      </div>
      {user.role !== 'SUPERADMIN' ? (
        <div className="flex gap-1">
          <button className={btnGhost} onClick={onEdit} title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button className={`${btnGhost} text-red-300 hover:bg-red-500/15`} onClick={onDelete} title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="hidden w-[88px] sm:block" />
      )}
    </div>
  );
}
