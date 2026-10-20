/* Qué archivos se pueden ver dentro del navegador (vista previa) y con qué visor. */

export type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'docx' | 'sheet' | 'pptx' | 'text';

/** Tamaño máximo para abrir un documento de Office en la vista previa (se descarga completo al navegador). */
export const OFFICE_MAX_BYTES = 30 * 1024 * 1024;
/** Tamaño máximo para abrir un archivo de texto o CSV. */
export const TEXT_MAX_BYTES = 20 * 1024 * 1024;

const SHEET_EXT = new Set(['xlsx', 'xlsm', 'xls', 'ods', 'csv', 'tsv']);
const TEXT_EXT = new Set([
  'txt', 'md', 'json', 'xml', 'log', 'ini', 'yml', 'yaml', 'sql', 'html', 'htm', 'css',
  'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'sh', 'bat', 'env', 'conf',
]);

function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i + 1).toLowerCase();
}

/**
 * Devuelve el visor que corresponde, o null si el archivo no tiene vista previa
 * (por ejemplo .doc / .ppt antiguos, zip, etc.: esos solo se descargan).
 */
export function previewKind(mime: string, name = ''): PreviewKind | null {
  const ext = extensionOf(name);
  const m = mime.toLowerCase();

  if (ext === 'docx') return 'docx';
  if (ext === 'pptx') return 'pptx';
  if (SHEET_EXT.has(ext)) return 'sheet';

  if (m.startsWith('image/') && m !== 'image/svg+xml') return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m === 'application/pdf' || ext === 'pdf') return 'pdf';

  if (TEXT_EXT.has(ext) || m.startsWith('text/')) return 'text';
  return null;
}