'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, errorMessage } from '@/lib/api';
import { Avatar, btnPrimary, ErrorBox, inputCls, RoleBadge, Spinner } from '@/components/ui';

export default function ProfilePage() {
  const { user, refresh } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [nameErr, setNameErr] = useState('');

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  if (!user) return null;

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    setNameMsg('');
    setNameErr('');
    try {
      await api.patch('/auth/profile', { fullName: fullName.trim() });
      await refresh();
      setNameMsg('Nombre actualizado');
    } catch (err) {
      setNameErr(errorMessage(err));
    } finally {
      setNameBusy(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (next !== confirm) {
      setPwErr('La nueva contraseña y su confirmación no coinciden');
      return;
    }
    setPwBusy(true);
    try {
      await api.patch('/auth/password', { currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      setPwMsg('Contraseña actualizada');
    } catch (err) {
      setPwErr(errorMessage(err));
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="page-in mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-white">Mi perfil</h1>

      <div className="flex items-center gap-4 border border-white/10 glass p-5">
        <Avatar name={user.fullName} size={56} />
        <div>
          <p className="text-lg font-semibold text-white">{user.fullName}</p>
          <p className="text-sm text-slate-400">@{user.username}</p>
          <div className="mt-1">
            <RoleBadge role={user.role} />
          </div>
        </div>
      </div>

      <form onSubmit={saveName} className="space-y-4 border border-white/10 glass p-5">
        <h2 className="font-semibold text-white">Datos personales</h2>
        <label className="block text-sm font-medium text-slate-200">
          Nombre completo
          <input
            className={`${inputCls} mt-1`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        {nameErr && <ErrorBox message={nameErr} />}
        {nameMsg && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {nameMsg}
          </p>
        )}
        <button
          type="submit"
          className={btnPrimary}
          disabled={nameBusy || fullName.trim().length < 2 || fullName.trim() === user.fullName}
        >
          {nameBusy && <Spinner className="h-4 w-4 text-white" />}
          Guardar nombre
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-4 border border-white/10 glass p-5">
        <h2 className="font-semibold text-white">Cambiar contraseña</h2>
        <label className="block text-sm font-medium text-slate-200">
          Contraseña actual
          <input
            type="password"
            className={`${inputCls} mt-1`}
            value={current}
            autoComplete="current-password"
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Nueva contraseña
          <input
            type="password"
            className={`${inputCls} mt-1`}
            value={next}
            autoComplete="new-password"
            onChange={(e) => setNext(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Repite la nueva contraseña
          <input
            type="password"
            className={`${inputCls} mt-1`}
            value={confirm}
            autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {pwErr && <ErrorBox message={pwErr} />}
        {pwMsg && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {pwMsg}
          </p>
        )}
        <button
          type="submit"
          className={btnPrimary}
          disabled={pwBusy || !current || next.length < 6 || !confirm}
        >
          {pwBusy && <Spinner className="h-4 w-4 text-white" />}
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}