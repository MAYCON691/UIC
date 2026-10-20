'use client';

import { useMemo } from 'react';

const MAX_CHARS = 500_000;

/** Vista previa de texto plano (txt, md, json, xml, log, código…). */
export default function TextView({ buffer }: { buffer: ArrayBuffer }) {
  const { text, truncated } = useMemo(() => {
    const full = new TextDecoder('utf-8').decode(buffer);
    return full.length > MAX_CHARS
      ? { text: full.slice(0, MAX_CHARS), truncated: true }
      : { text: full, truncated: false };
  }, [buffer]);

  return (
    <div className="w-full">
      <pre className="preview-text preview-scroll">{text}</pre>
      {truncated && (
        <p className="preview-note">Se muestra el inicio del archivo. Descárgalo para verlo completo.</p>
      )}
    </div>
  );
}