'use client';

import { formatBytes } from '@/lib/format';
import { OFFICE_MAX_BYTES, TEXT_MAX_BYTES, type PreviewKind } from '@/lib/preview';
import { useFileBuffer } from '@/hooks/useFileBuffer';
import type { FileItem } from '@/lib/types';
import { ErrorBox, Spinner } from '@/components/ui';
import DocxView from './DocxView';
import PptxView from './PptxView';
import SheetView from './SheetView';
import TextView from './TextView';

/** Visores que dibujan el archivo en el navegador (Word, Excel, PowerPoint y texto). */
export default function FetchedView({
  file,
  kind,
}: {
  file: FileItem;
  kind: 'docx' | 'sheet' | 'pptx' | 'text';
}) {
  const limit = kind === 'text' ? TEXT_MAX_BYTES : OFFICE_MAX_BYTES;
  const tooBig = file.size > limit;
  const { buffer, error } = useFileBuffer(file.id, !tooBig);

  if (tooBig) {
    return (
      <ErrorBox
        message={`El archivo pesa ${formatBytes(file.size)} y es demasiado grande para la vista previa. Descárgalo para abrirlo.`}
      />
    );
  }
  if (error) return <ErrorBox message={error} />;
  if (!buffer) return <Spinner />;

  const views: Record<Exclude<PreviewKind, 'image' | 'video' | 'audio' | 'pdf'>, React.ReactNode> = {
    docx: <DocxView buffer={buffer} />,
    pptx: <PptxView buffer={buffer} />,
    sheet: <SheetView buffer={buffer} isCsv={/\.(csv|tsv)$/i.test(file.originalName)} />,
    text: <TextView buffer={buffer} />,
  };
  return <>{views[kind]}</>;
}