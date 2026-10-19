/** Marca de los tokens de descarga (distintos de los tokens de sesión). */
export const TOKEN_TYPE_FILE = 'file';

/** Vida de un ticket de descarga: alcanza para ver un video largo. */
export const FILE_TICKET_TTL = '2h';

export interface FileTicketPayload {
  sub: number;
  fid: number;
  typ: typeof TOKEN_TYPE_FILE;
}
