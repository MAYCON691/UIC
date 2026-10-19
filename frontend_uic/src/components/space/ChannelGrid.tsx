'use client';

import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Channel } from '@/lib/types';
import { btnPrimary, Spinner } from '@/components/ui';

const CARD_BASE = 'glass hud rise cursor-pointer border p-4 transition-all duration-300 hover:-translate-y-0.5';
const CARD_ON = 'border-cyan-400/70 bg-cyan-400/10 ring-2 ring-cyan-400/20';
const CARD_OFF = 'border-white/10 glass hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)]';

/** Tarjetas de canales: "Todos" + uno por cada canal del usuario. */
export default function ChannelGrid({
  channels,
  loading,
  readOnly,
  selectedId,
  totalFiles,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  channels: Channel[];
  loading: boolean;
  readOnly: boolean;
  selectedId: number | null;
  totalFiles: number;
  onSelect: (id: number | null) => void;
  onNew: () => void;
  onRename: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Canales</h2>
        {!readOnly && (
          <button className={btnPrimary} onClick={onNew}>
            <Plus className="h-4 w-4" />
            Añadir canal
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : channels.length === 0 ? (
        <div className="border border-dashed border-white/15 glass p-8 text-center text-sm text-slate-400">
          {readOnly
            ? 'Este usuario todavía no tiene canales.'
            : 'Aún no tienes canales. Crea el primero (por ejemplo ATB o Red Uno) con “Añadir canal”.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(null)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(null)}
            className={`${CARD_BASE} ${selectedId === null ? CARD_ON : CARD_OFF}`}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-white/10 text-white">
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold text-white">Todos los canales</p>
            <p className="text-xs text-slate-400">{totalFiles} archivos</p>
          </div>

          {channels.map((c, i) => (
            <div
              key={c.id}
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(c.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(c.id)}
              className={`group ${CARD_BASE} ${selectedId === c.id ? CARD_ON : CARD_OFF}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center bg-cyan-500/25 text-sm font-bold text-white">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                {!readOnly && (
                  <div className="flex gap-1 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      title="Renombrar canal"
                      className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(c);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Eliminar canal"
                      className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-3 truncate font-semibold text-white">{c.name}</p>
              <p className="text-xs text-slate-400">
                {c._count.files} archivos · {c.categories.length} categorías
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
