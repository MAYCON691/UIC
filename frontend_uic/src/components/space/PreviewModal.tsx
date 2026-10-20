'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { errorMessage } from '@/lib/http';
import { previewKind } from '@/lib/preview';
import type { FileItem } from '@/lib/types';
import { filesService } from '@/services';
import { btnPrimary, ErrorBox, Modal, Spinner } from '@/components/ui';
import FetchedView from './preview/FetchedView';

const NO_PLAY = 'Tu navegador no puede reproducir este formato. Descárgalo para abrirlo.';

/**
 * Vista previa de imagen, video, audio, PDF, Word (.docx), Excel (.xlsx/.xls/.csv),
 * PowerPoint (.pptx) y texto. La URL usa un ticket temporal.
 */
export default function PreviewModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const kind = previewKind(file.mimeType, file.originalName);
  const isMedia = kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'pdf';
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [mediaError, setMediaError] = useState(false);

  // Solo imagen, video, audio y PDF usan la URL directa; el resto se descarga a memoria y se dibuja.
  useEffect(() => {
    if (!isMedia) return;
    let alive = true;
    filesService
      .ticketUrl(file.id, true)
      .then((u) => alive && setUrl(u))
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [file.id, isMedia]);

  async function download() {
    try {
      await filesService.download(file.id);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <Modal title={file.originalName} onClose={onClose} wide>
      <div className="flex min-h-[200px] items-center justify-center">
        {error && <ErrorBox message={error} />}
        {mediaError && <ErrorBox message={NO_PLAY} />}
        {isMedia && !url && !error && <Spinner />}
        {url && !mediaError && kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.originalName} className="max-h-[70vh] max-w-full " />
        )}
        {url && !mediaError && kind === 'video' && (
          <video
            src={url}
            controls
            autoPlay
            onError={() => setMediaError(true)}
            className="max-h-[70vh] w-full bg-black"
          />
        )}
        {url && !mediaError && kind === 'audio' && (
          <audio src={url} controls autoPlay onError={() => setMediaError(true)} className="w-full" />
        )}
        {url && kind === 'pdf' && (
          <iframe src={url} title={file.originalName} className="h-[70vh] w-full border border-white/15" />
        )}
        {(kind === 'docx' || kind === 'sheet' || kind === 'pptx' || kind === 'text') && (
          <FetchedView file={file} kind={kind} />
        )}
        {!kind && <ErrorBox message="Este tipo de archivo no tiene vista previa. Descárgalo para abrirlo." />}
      </div>
      <div className="mt-4 flex justify-end">
        <button className={btnPrimary} onClick={download}>
          <Download className="h-4 w-4" />
          Descargar
        </button>
      </div>
    </Modal>
  );
}