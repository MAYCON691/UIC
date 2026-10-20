'use client';

import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/http';
import { ErrorBox, Spinner } from '@/components/ui';

/** Vista previa de Word (.docx), dibujada en el navegador. */
export default function DocxView({ buffer }: { buffer: ArrayBuffer }) {
  const host = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        el.innerHTML = '';
        await renderAsync(buffer, el, undefined, {
          className: 'docx',
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        });
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
      el.innerHTML = '';
    };
  }, [buffer]);

  return (
    <div className="preview-scroll w-full">
      {loading && <Spinner />}
      {error && <ErrorBox message={`No se pudo mostrar el documento. ${error}`} />}
      <div ref={host} className="preview-docx" />
    </div>
  );
}