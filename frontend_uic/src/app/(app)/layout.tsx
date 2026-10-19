'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Cloud, FolderOpen, LogOut, User as UserIcon, UserCog, Users, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { Avatar, FullSpinner, RoleBadge } from '@/components/ui';
import ThemeToggle from '@/components/ThemeToggle';

/* Estilos de esta estructura: src/styles/app-shell.css */

const NAV: { href: string; label: string; icon: LucideIcon; roles?: Role[] }[] = [
  { href: '/dashboard', label: 'Mi espacio', icon: FolderOpen },
  { href: '/team', label: 'Equipo', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/users', label: 'Usuarios', icon: UserCog, roles: ['SUPERADMIN'] },
  { href: '/profile', label: 'Mi perfil', icon: UserIcon },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <FullSpinner />;

  const items = NAV.filter((n) => !n.roles || n.roles.includes(user.role));
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="shell">
      {/* Menú lateral (escritorio) */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand__mark glow-pulse">
            <Cloud className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="brand__name">Nube UIC</p>
            <p className="brand__sub">Imagen Corporativa</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          {items.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`nav-link rise ${isActive(n.href) ? 'is-active' : ''}`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__profile">
            <Avatar name={user.fullName} />
            <div className="min-w-0">
              <p className="sidebar__name">{user.fullName}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <ThemeToggle showLabel />
          <button onClick={logout} className="btn btn-ghost sidebar__logout">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="shell__body">
        {/* Barra superior (móvil) */}
        <header className="topbar">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className={`topbar__link ${isActive(n.href) ? 'is-active' : ''}`}>
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
          <div className="topbar__spacer">
            <ThemeToggle />
            <button onClick={logout} className="topbar__exit">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </header>

        <main className="shell__main">
          <div className="shell__content">{children}</div>
        </main>
      </div>
    </div>
  );
}