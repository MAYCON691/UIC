import type { ReactNode } from 'react';
import type { User } from '@/lib/types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/** Estructura general de la app: menú fijo + contenido que se desplaza. */
export default function AppShell({
  user,
  onLogout,
  children,
}: {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="shell__body">
        <Topbar user={user} onLogout={onLogout} />
        <main className="shell__main">
          <div className="shell__content">{children}</div>
        </main>
      </div>
    </div>
  );
}
