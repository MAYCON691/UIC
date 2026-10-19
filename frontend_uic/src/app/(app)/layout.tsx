'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FullSpinner } from '@/components/ui';
import AppShell from '@/components/layout/AppShell';

/* Todas las pantallas internas pasan por aquí: sin sesión se vuelve al login. */

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <FullSpinner />;

  return (
    <AppShell user={user} onLogout={logout}>
      {children}
    </AppShell>
  );
}
