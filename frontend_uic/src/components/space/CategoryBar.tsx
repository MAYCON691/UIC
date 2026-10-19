'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Category, Channel } from '@/lib/types';

const PILL_ON = 'border-cyan-400 bg-cyan-500/25 text-white shadow-[0_0_16px_rgba(34,211,238,0.35)]';
const PILL_OFF = 'border-white/15 glass text-slate-200 hover:border-cyan-400/60';

/** Categorías del canal elegido (filtro + crear / renombrar / eliminar). */
export default function CategoryBar({
  channel,
  selected,
  readOnly,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  channel: Channel;
  selected: Category | null;
  readOnly: boolean;
  onSelect: (id: number | null) => void;
  onNew: () => void;
  onRename: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Categorías
      </span>
      <button
        onClick={() => onSelect(null)}
        className={`border px-3 py-1 text-sm transition ${selected === null ? PILL_ON : PILL_OFF}`}
      >
        Todas ({channel._count.files})
      </button>
      {channel.categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`border px-3 py-1 text-sm transition ${selected?.id === cat.id ? PILL_ON : PILL_OFF}`}
        >
          {cat.name} ({cat._count.files})
        </button>
      ))}
      {!readOnly && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1 border border-dashed border-white/15 px-3 py-1 text-sm text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Categoría
        </button>
      )}
      {!readOnly && selected && (
        <span className="ml-1 flex gap-1">
          <button
            title="Renombrar categoría"
            className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
            onClick={() => onRename(selected)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            title="Eliminar categoría"
            className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-300"
            onClick={() => onDelete(selected)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      )}
    </section>
  );
}
