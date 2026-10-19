import type { Role } from '@/lib/types';

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Administrador',
  MONITORISTA: 'Monitorista',
};

const ROLE_BADGE: Record<Role, string> = {
  SUPERADMIN: 'badge--superadmin',
  ADMIN: 'badge--admin',
  MONITORISTA: 'badge--monitorista',
};

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge ${ROLE_BADGE[role]}`}>{ROLE_LABEL[role]}</span>;
}
