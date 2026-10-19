'use client';

import { useAuth } from '@/lib/auth';
import SpaceView from '@/components/SpaceView';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <SpaceView userId={user.id} readOnly={false} title="Mi espacio" />;
}