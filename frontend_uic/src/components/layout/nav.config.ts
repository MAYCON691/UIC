import { FolderOpen, User as UserIcon, UserCog, Users, type LucideIcon } from 'lucide-react';
import type { Role } from '@/lib/types';

/* Opciones del menú. Si `roles` existe, solo se muestran a esos roles. */

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Mi espacio', icon: FolderOpen },
  { href: '/team', label: 'Equipo', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/users', label: 'Usuarios', icon: UserCog, roles: ['SUPERADMIN'] },
  { href: '/profile', label: 'Mi perfil', icon: UserIcon },
];

export function navItemsFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((n) => !n.roles || n.roles.includes(role));
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}
