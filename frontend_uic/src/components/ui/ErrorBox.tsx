import { AlertCircle } from 'lucide-react';

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="alert-error shake">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
