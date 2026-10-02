import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertNotification } from '../types';
import { markNotificationRead, markAllNotificationsRead, seedInitialPortData } from '../services/terminalService';
import {
  Anchor,
  Bell,
  CheckCheck,
  Database,
  LogOut,
  RefreshCw,
  Shield,
  User,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';

interface NavbarProps {
  notifications: AlertNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ notifications, activeTab, setActiveTab }) => {
  const { user, logout, isDbConnected } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleSeed = async () => {
    if (confirm('Muat data simulasi terminal peti kemas lengkap ke database online? (Kapal, Dermaga, Crane, Peti Kemas, Gate)')) {
      setIsSeeding(true);
      try {
        await seedInitialPortData(user?.displayName || 'Petugas');
        alert('Data simulasi terminal peti kemas berhasil dimuat ke database online!');
      } catch (err: any) {
        alert('Gagal memuat data: ' + err.message);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = unreadNotifs.map((n) => n.id);
    if (unreadIds.length > 0) {
      await markAllNotificationsRead(unreadIds);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Planner':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Operator':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'GateOfficer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Port Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
              <Anchor className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  PORT<span className="text-cyan-400">OS</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  TOS ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Terminal Peti Kemas Modern v2.6</p>
            </div>

            {/* DB status badge */}
            <div className="hidden lg:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-950 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3 h-3 text-slate-400" />
              <span className="text-slate-300">Firebase Firestore: {isDbConnected ? 'Online' : 'Reconnecting'}</span>
            </div>
          </div>

          {/* Right actions: Seeding, Notifications, User Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Data Seed Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              title="Isi database dengan data kapal, peti kemas & jadwal contoh"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Memuat...' : 'Muat Data Contoh'}</span>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200">Notifikasi Otomatis Terminal</span>
                      {unreadNotifs.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {unreadNotifs.length} Baru
                        </span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Tandai Dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">Belum ada notifikasi operasional</div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`py-2.5 px-1.5 rounded-lg flex items-start gap-2.5 transition cursor-pointer ${
                            notif.read ? 'opacity-65 hover:bg-slate-800/40' : 'bg-slate-800/40 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.severity === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                            ) : notif.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : notif.severity === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Info className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-200 truncate">{notif.title}</span>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/40 shadow-sm shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">{user?.displayName}</div>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role || 'Staff'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Keluar dari PortOS"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
