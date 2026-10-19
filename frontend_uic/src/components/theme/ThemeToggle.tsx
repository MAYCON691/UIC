'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

/** Botón día / noche. Con showLabel=true muestra también el texto. */
export default function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const target = theme === 'dark' ? 'claro' : 'oscuro';

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${showLabel ? 'theme-toggle--label' : ''}`}
      title={`Cambiar a modo ${target}`}
      aria-label={`Cambiar a modo ${target}`}
    >
      <span className="theme-toggle__icon" aria-hidden>
        <Sun className="theme-toggle__sun" />
        <Moon className="theme-toggle__moon" />
      </span>
      {showLabel && <span>{theme === 'dark' ? 'Modo día' : 'Modo noche'}</span>}
    </button>
  );
}
