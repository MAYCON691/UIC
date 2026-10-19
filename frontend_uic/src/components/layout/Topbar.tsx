'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { User } from '@/lib/types';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { isActivePath, navItemsFor } from './nav.config';

/** Barra superior fija (celular). Estilos: src/styles/app-shell.css */
export default function Topbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const pathname = usePathname();
  const items = navItemsFor(user.role);

  return (
    <header className="topbar">
      {items.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`topbar__link ${isActivePath(pathname, n.href) ? 'is-active' : ''}`}
        >
          <n.icon className="h-4 w-4" />
          {n.label}
        </Link>
      ))}
      <div className="topbar__spacer">
        <ThemeToggle />
        <button onClick={onLogout} className="topbar__exit">
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
