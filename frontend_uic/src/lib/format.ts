/* Utilidades de formato: tamaños, fechas y tipo de archivo. */

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
}

export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'sheet'
  | 'slides'
  | 'archive'
  | 'text'
  | 'other';

export function fileKind(mime: string, name = ''): FileKind {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m === 'application/pdf') return 'pdf';
  if (m.includes('word') || /\.(docx?|odt|rtf)$/.test(n)) return 'word';
  if (m.includes('excel') || m.includes('spreadsheet') || /\.(xlsx?|csv|ods)$/.test(n)) return 'sheet';
  if (m.includes('powerpoint') || m.includes('presentation') || /\.(pptx?|odp)$/.test(n)) return 'slides';
  if (
    m.includes('zip') ||
    m.includes('rar') ||
    m.includes('compressed') ||
    m.includes('tar') ||
    /\.(zip|rar|7z|tar|gz)$/.test(n)
  )
    return 'archive';
  if (m.startsWith('text/')) return 'text';
  return 'other';
}
