'use client';

import { useEffect, useState } from 'react';
import { errorMessage } from '@/lib/http';
import { filesService } from '@/services';

/** Descarga un archivo a memoria para los visores del navegador (solo si `enabled`). */
export function useFileBuffer(fileId: number, enabled = true) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    filesService
      .fetchBuffer(fileId)
      .then((b) => alive && setBuffer(b))
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [fileId, enabled]);

  return { buffer, error };
}