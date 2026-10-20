'use client';

import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/http';
import { ErrorBox, Spinner } from '@/components/ui';

/** Vista previa de PowerPoint (.pptx): todas las diapositivas en una lista. */
export default function PptxView({ buffer }: { buffer: ArrayBuffer }) {
  const host = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;
    let previewer: { destroy: () => void } | null = null;
    (async () => {
      try {
        const { init } = await import('pptx-preview');
        el.innerHTML = '';
        const width = Math.max(320, Math.min(el.clientWidth || 800, 960));
        const p = init(el, { width, height: Math.round((width * 9) / 16), mode: 'list' });
        previewer = p;
        await p.preview(buffer);
        if (alive) setLoading(false);
      } catch (e) {
        if (alive) {
          setError(errorMessage(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
      try {
        previewer?.destroy();
      } catch {
        /* nada que limpiar */
      }
      el.innerHTML = '';
    };
  }, [buffer]);

  return (
    <div className="preview-scroll w-full">
      {loading && <Spinner />}
      {error && <ErrorBox message={`No se pudo mostrar la presentación. ${error}`} />}
      <div ref={host} className="preview-pptx" />
    </div>
  );
}