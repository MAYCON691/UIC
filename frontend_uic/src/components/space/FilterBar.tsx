'use client';

import { Search } from 'lucide-react';
import { inputCls } from '@/components/ui';
import { SORTS, TYPES } from './constants';

/** Buscador por nombre + filtro de tipo + orden. */
export default function FilterBar({
  searchInput,
  onSearchInput,
  type,
  onType,
  sort,
  onSort,
}: {
  searchInput: string;
  onSearchInput: (value: string) => void;
  type: string;
  onType: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3 border border-white/10 glass p-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Buscar por nombre…"
          value={searchInput}
          onChange={(e) => onSearchInput(e.target.value)}
        />
      </div>
      <select className={`${inputCls} sm:w-44`} value={type} onChange={(e) => onType(e.target.value)}>
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <select className={`${inputCls} sm:w-44`} value={sort} onChange={(e) => onSort(e.target.value)}>
        {Object.entries(SORTS).map(([key, s]) => (
          <option key={key} value={key}>
            {s.label}
          </option>
        ))}
      </select>
    </section>
  );
}
