import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import {
  Ship,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Anchor,
  Compass,
  Cpu,
  Truck,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemoRole, authError, clearAuthError, isDbConnected } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@terminal.id');
  const [password, setPassword] = useState('admin123');
  const [displayName, setDisplayName] = useState('Admin Pelabuhan');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAuthError();
    try {
      if (isRegister) {
        await registerWithEmail(displayName, email, password, selectedRole);
      } else {
        await loginWithEmail(email, password, selectedRole);
      }
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRole = async (role: Role) => {
    setIsSubmitting(true);
    try {
      await loginAsDemoRole(role);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background visual accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid line overlay for industrial tech feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Header branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-3 ring-4 ring-cyan-500/20">
            <Anchor className="w-9 h-9 text-slate-950 font-bold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PORT<span className="text-cyan-400">OS</span> TERMINAL
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Sistem Operasi Terminal Peti Kemas (Container Terminal Operating System)
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5" />
            <span>Database Online: {isDbConnected ? 'Firebase Firestore Terhubung' : 'Memeriksa Koneksi...'}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Tabs: Masuk / Daftar */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); clearAuthError(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk Akun (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); clearAuthError(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Petugas Baru
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Lengkap Petugas</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Capt. Hendra Gunawan"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Username / Email Petugas</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@terminal.id"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Kata Sandi (Password)</label>
                <span className="text-[11px] text-slate-500">Minimal 4 karakter</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Otoritas / Peran Petugas</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'Admin' as Role, label: 'Admin Terminal', desc: 'Akses Penuh CRUD' },
                  { role: 'Planner' as Role, label: 'Vessel Planner', desc: 'Sandar & Yard' },
                  { role: 'Operator' as Role, label: 'Crane Operator', desc: 'Bongkar Muat' },
                  { role: 'GateOfficer' as Role, label: 'Gate Officer', desc: 'Gate In / Out' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(item.role);
                      if (!isRegister) {
                        if (item.role === 'Admin') setEmail('admin@terminal.id');
                        if (item.role === 'Planner') setEmail('planner@terminal.id');
                        if (item.role === 'Operator') setEmail('operator@terminal.id');
                        if (item.role === 'GateOfficer') setEmail('gate@terminal.id');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === item.role
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{item.label}</span>
                      {selectedRole === item.role && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Daftar & Masuk ke Sistem' : 'Masuk ke Terminal PortOS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500">atau masuk cepat</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200 flex items-center justify-center gap-3 transition cursor-pointer mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          {/* Quick Demo Role Logins */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Masuk Cepat 1-Klik (Preset Akun Operasional):
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('Admin')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-slate-300 text-xs font-medium text-left flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="truncate">Admin Port</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Planner')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-slate-300 text-xs font-medium text-left flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="truncate">Ship Planner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Operator')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-slate-300 text-xs font-medium text-left flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="truncate">STS Operator</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('GateOfficer')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/70 text-slate-300 text-xs font-medium text-left flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="truncate">Gate Officer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Pelabuhan Peti Kemas Berbasis Cloud &bull; ISO 27001 Maritime Compliance</p>
        </div>
      </div>
    </div>
  );
};
