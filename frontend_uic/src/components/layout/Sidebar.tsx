'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, LogOut } from 'lucide-react';
import type { User } from '@/lib/types';
import { Avatar, RoleBadge } from '@/components/ui';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { isActivePath, navItemsFor } from './nav.config';

/** Menú lateral fijo (escritorio). Estilos: src/styles/app-shell.css */
export default function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const pathname = usePathname();
  const items = navItemsFor(user.role);

  return (
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
            className={`nav-link rise ${isActivePath(pathname, n.href) ? 'is-active' : ''}`}
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
        <button onClick={onLogout} className="btn btn-ghost sidebar__logout">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
