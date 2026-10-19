import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-6 w-6 text-cyan-300' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function FullSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-9 w-9 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
    </div>
  );
}
