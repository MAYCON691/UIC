'use client';

import Link from 'next/link';
import { FileText, FolderOpen, HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/format';
import type { TeamUser } from '@/lib/types';
import { Avatar, RoleBadge } from '@/components/ui';

/** Tarjeta de una persona del equipo; lleva a su espacio. */
export default function UserCard({
  user,
  isMe,
  index,
}: {
  user: TeamUser;
  isMe: boolean;
  index: number;
}) {
  return (
    <Link
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      href={isMe ? '/dashboard' : `/team/${user.id}`}
      className="hud rise border border-white/10 glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.28)]"
    >
      <div className="flex items-center gap-3">
        <Avatar name={user.fullName} size={48} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">
            {user.fullName}
            {isMe && <span className="ml-1 text-xs font-normal text-slate-400">(tú)</span>}
          </p>
          <p className="truncate text-xs text-slate-400">@{user.username}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <RoleBadge role={user.role} />
        {!user.active && (
          <span className="bg-white/15 px-2.5 py-0.5 text-xs font-medium text-slate-300">Inactivo</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center text-xs text-slate-400">
        <div>
          <FolderOpen className="mx-auto h-4 w-4 text-slate-400" />
          <p className="mt-1 font-semibold text-slate-100">{user._count.channels}</p>
          canales
        </div>
        <div>
          <FileText className="mx-auto h-4 w-4 text-slate-400" />
          <p className="mt-1 font-semibold text-slate-100">{user._count.files}</p>
          archivos
        </div>
        <div>
          <HardDrive className="mx-auto h-4 w-4 text-slate-400" />
          <p className="mt-1 font-semibold text-slate-100">{formatBytes(user.storageBytes)}</p>
          espacio
        </div>
      </div>
    </Link>
  );
}
