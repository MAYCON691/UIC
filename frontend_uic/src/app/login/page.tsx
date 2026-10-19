'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/api';
import { btnPrimary, ErrorBox, inputCls, Spinner } from '@/components/ui';
import ThemeToggle from '@/components/ThemeToggle';

/* Estilos de esta pantalla: src/styles/login.css */

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="login">
      {/* Fondo: imagen de /public/jacha.png */}
      <div className="login__bg" aria-hidden />
      <div className="grid-fx login__grid" aria-hidden />

      <div className="login__toggle">
        <ThemeToggle />
      </div>

      <div className="login__card glass-strong hud pop-in">
        <div className="scan-bar" />

        <div className="login__brand">
          <div className="login__logo glow-pulse">
            <Cloud className="h-8 w-8" />
          </div>
          <h1 className="login__title">Nube UIC</h1>
          <p className="login__subtitle">Unidad de Imagen Corporativa</p>
        </div>

        <form onSubmit={onSubmit} className="login__form">
          <label className="login__label">
            Usuario
            <div className="login__field">
              <UserIcon className="login__icon" />
              <input
                className={`${inputCls} login__input`}
                value={username}
                autoComplete="username"
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </label>

          <label className="login__label">
            Contraseña
            <div className="login__field">
              <Lock className="login__icon" />
              <input
                className={`${inputCls} login__input login__input--password`}
                type={show ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="login__eye"
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            className={`${btnPrimary} login__submit`}
            disabled={busy || !username || !password}
          >
            {busy && <Spinner className="h-4 w-4 text-cyan-100" />}
            Ingresar
          </button>
        </form>

        <p className="login__footer">Acceso restringido</p>
      </div>
    </main>
  );
}