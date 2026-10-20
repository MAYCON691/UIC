'use client';

import { Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { fileKind, formatBytes, formatDate } from '@/lib/format';
import { previewKind } from '@/lib/preview';
import type { FileItem } from '@/lib/types';
import { btnGhost } from '@/components/ui';
import { KIND_STYLE } from './constants';

/** Una fila de la lista de archivos. */
export default function FileRow({
  file,
  readOnly,
  index,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}: {
  file: FileItem;
  index: number;
  readOnly: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const kind = fileKind(file.mimeType, file.originalName);
  const { icon: Icon, color } = KIND_STYLE[kind];
  const canPreview = previewKind(file.mimeType, file.originalName) !== null;

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
      className="rise flex flex-col gap-3 border border-white/10 glass p-3 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-white" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="truncate text-xs text-slate-400">
            {formatBytes(file.size)} · {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:w-56 sm:justify-end">
        <span className="bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
          {file.channel.name}
        </span>
        <span className="bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
          {file.category.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {canPreview && (
          <button className={btnGhost} onClick={onPreview} title="Ver">
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button className={btnGhost} onClick={onDownload} title="Descargar">
          <Download className="h-4 w-4" />
        </button>
        {!readOnly && (
          <>
            <button className={btnGhost} onClick={onEdit} title="Editar">
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className={`${btnGhost} text-red-300 hover:bg-red-500/15`}
              onClick={onDelete}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}