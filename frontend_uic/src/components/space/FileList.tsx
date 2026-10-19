'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FileItem, FilesPage } from '@/lib/types';
import { btnGhost, Spinner } from '@/components/ui';
import FileRow from './FileRow';

/** Lista de archivos con su contador, mensaje vacío y paginación. */
export default function FileList({
  data,
  loading,
  readOnly,
  page,
  onPageChange,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}: {
  data: FilesPage | null;
  loading: boolean;
  readOnly: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onEdit: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}) {
  return (
    <section>
      <p className="mb-2 text-sm text-slate-400">
        {data ? `${data.total} archivo${data.total === 1 ? '' : 's'}` : ''}
      </p>

      {loading && !data ? (
        <Spinner />
      ) : data && data.items.length === 0 ? (
        <div className="border border-dashed border-white/15 glass p-10 text-center text-sm text-slate-400">
          No hay archivos con estos filtros.
        </div>
      ) : (
        <div className={`space-y-2 transition ${loading ? 'opacity-60' : ''}`}>
          {data?.items.map((f, i) => (
            <FileRow
              key={f.id}
              index={i}
              file={f}
              readOnly={readOnly}
              onPreview={() => onPreview(f)}
              onDownload={() => onDownload(f)}
              onEdit={() => onEdit(f)}
              onDelete={() => onDelete(f)}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button className={btnGhost} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="text-sm text-slate-300">
            Página {data.page} de {data.totalPages}
          </span>
          <button
            className={btnGhost}
            disabled={page >= data.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
