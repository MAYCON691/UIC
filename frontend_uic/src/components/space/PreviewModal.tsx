'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { errorMessage } from '@/lib/http';
import { fileKind } from '@/lib/format';
import type { FileItem } from '@/lib/types';
import { filesService } from '@/services';
import { btnPrimary, ErrorBox, Modal, Spinner } from '@/components/ui';

/** Vista previa de imagen, video, audio o PDF. La URL usa un ticket temporal. */
export default function PreviewModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const kind = fileKind(file.mimeType, file.originalName);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    filesService
      .ticketUrl(file.id, true)
      .then((u) => alive && setUrl(u))
      .catch((e) => alive && setError(errorMessage(e)));
    return () => {
      alive = false;
    };
  }, [file.id]);

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
        {!url && !error && <Spinner />}
        {url && kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.originalName} className="max-h-[70vh] max-w-full " />
        )}
        {url && kind === 'video' && (
          <video src={url} controls autoPlay className="max-h-[70vh] w-full bg-black" />
        )}
        {url && kind === 'audio' && <audio src={url} controls autoPlay className="w-full" />}
        {url && kind === 'pdf' && (
          <iframe src={url} title={file.originalName} className="h-[70vh] w-full border border-white/15" />
        )}
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
