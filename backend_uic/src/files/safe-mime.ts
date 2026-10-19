/**
 * Tipos que se pueden MOSTRAR dentro del navegador (vista previa).
 * Todo lo demás (html, svg, js…) solo se descarga: así un archivo subido
 * nunca se ejecuta como página dentro del sitio.
 */
const INLINE_SAFE = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/bmp',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac',
  'audio/mp4', 'audio/x-m4a', 'audio/flac',
  'application/pdf',
]);

export function isInlineSafe(mimeType: string): boolean {
  return INLINE_SAFE.has(mimeType.toLowerCase().split(';')[0].trim());
}
