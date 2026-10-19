'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, UploadCloud, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui';
import type { UploadItem } from './types';

/** Zona de arrastrar y soltar + lista de subidas en curso. */
export default function UploadZone({
  target,
  hint,
  uploads,
  onFiles,
  onClear,
}: {
  /** Texto "Canal › Categoría" si ya se puede subir; null si falta elegir. */
  target: string | null;
  hint: string;
  uploads: UploadItem[];
  onFiles: (files: File[]) => void;
  onClear: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const canUpload = target !== null;

  return (
    <section className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (canUpload) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (canUpload) onFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => canUpload && input.current?.click()}
        className={`flex flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition-all duration-300 ${
          canUpload
            ? dragOver
              ? 'scale-[1.01] cursor-pointer border-cyan-400/70 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.25)]'
              : 'cursor-pointer border-white/15 glass hover:border-cyan-400/60 hover:bg-cyan-400/5'
            : 'cursor-not-allowed border-white/10 bg-white/[0.03]'
        }`}
      >
        <UploadCloud className={`h-10 w-10 ${canUpload ? 'float text-cyan-300' : 'text-slate-600'}`} />
        <p className={`mt-2 font-medium ${canUpload ? 'text-slate-100' : 'text-slate-400'}`}>
          Jala tus archivos aquí o haz clic para elegirlos
        </p>
        <p className="mt-1 text-sm text-slate-400">{canUpload ? `Se guardarán en ${target}` : hint}</p>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            e.target.value = '';
            onFiles(list);
          }}
        />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2 border border-white/10 glass p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">Subidas</p>
            <button className="text-xs text-slate-400 hover:text-white" onClick={onClear}>
              Limpiar lista
            </button>
          </div>
          {uploads.map((u) => (
            <div key={u.id} className="text-sm">
              <div className="flex items-center gap-2">
                {u.status === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}
                {u.status === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-300" />}
                {u.status === 'uploading' && <Spinner className="h-4 w-4 shrink-0 text-cyan-300" />}
                <span className="truncate text-slate-100">{u.name}</span>
                <span className="ml-auto shrink-0 text-xs text-slate-400">
                  {u.status === 'uploading' ? `${u.progress}%` : u.status === 'done' ? 'Listo' : 'Error'}
                </span>
              </div>
              {u.status === 'uploading' && (
                <div className="mt-1 h-1.5 overflow-hidden bg-white/10">
                  <div
                    className="h-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-all"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              {u.status === 'error' && <p className="mt-0.5 text-xs text-red-300">{u.error}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
