'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_KEY = 'uic_theme';

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Lee el tema actual desde <html data-theme="...">. */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/** En el servidor siempre se pinta el tema oscuro (el script del layout lo corrige antes de mostrar). */
function getServerSnapshot(): Theme {
  return 'dark';
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  root.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignorar: navegación privada */
  }
  listeners.forEach((l) => l());
  window.setTimeout(() => root.classList.remove('theme-transition'), 600);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}

/** Script que se ejecuta ANTES de pintar para evitar el parpadeo al cargar. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;