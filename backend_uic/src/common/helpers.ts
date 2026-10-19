import { ForbiddenException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuthUser } from '../auth/auth-user';

export const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  role: true,
  active: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const isUniqueError = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

/** Ver/descargar: el dueño, los admins y el superadmin. Monitorista solo lo suyo. */
export function assertCanView(user: AuthUser, targetUserId: number) {
  const ok =
    user.id === targetUserId || user.role === Role.ADMIN || user.role === Role.SUPERADMIN;
  if (!ok) throw new ForbiddenException('No tienes acceso a este espacio');
}

/** Editar/borrar: SOLO el dueño (nadie más, ni el superadmin). */
export function assertOwner(user: AuthUser, ownerId: number) {
  if (user.id !== ownerId) {
    throw new ForbiddenException('Solo el dueño puede modificar esto');
  }
}