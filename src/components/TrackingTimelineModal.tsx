import React from 'react';
import { Container, ContainerMove } from '../types';
import {
  X,
  History,
  Ship,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react';

interface TrackingTimelineModalProps {
  container: Container | null;
  moves: ContainerMove[];
  onClose: () => void;
}

export const TrackingTimelineModal: React.FC<TrackingTimelineModalProps> = ({ container, moves, onClose }) => {
  if (!container) return null;

  const containerMoves = moves.filter((m) => m.containerNo === container.containerNo);

  const getMoveIcon = (type: string) => {
    switch (type) {
      case 'Discharge':
      case 'Load':
        return <Ship className="w-4 h-4 text-cyan-400" />;
      case 'Gate-In':
      case 'Gate-Out':
        return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'Yard-Shifting':
        return <Compass className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">{container.containerNo}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {container.size} {container.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Shipping Line: <span className="text-slate-200 font-medium">{container.shippingLine}</span> | Segel:{' '}
                <span className="text-slate-200 font-medium">{container.sealNo || '-'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status summary card */}
        <div className="p-6 bg-slate-900/40 border-b border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Status Posisi</span>
              <span className="font-semibold text-slate-200">{container.status}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Slot Yard</span>
              <span className="font-semibold text-cyan-400">
                Blok {container.yardBlock} &bull; Bay {container.yardBay}-{container.yardRow}-{container.yardTier}
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Berat Kotor</span>
              <span className="font-semibold text-slate-200">{(container.grossWeightKg || 0).toLocaleString()} kg</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1 text-[10px] uppercase font-bold tracking-wider">Dwelling Time</span>
              <span className="font-semibold text-amber-400">{container.dwellDays || 1} Hari</span>
            </div>
          </div>
        </div>

        {/* Timeline list */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Histori Lengkap Jejak Pelacakan (Audit Trail):
          </h4>

          {containerMoves.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada riwayat pergerakan yang tersimpan untuk peti kemas ini.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {containerMoves.map((m, index) => (
                <div key={m.id} className="relative group">
                  {/* Timeline circle icon */}
                  <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-cyan-400 transition">
                    {getMoveIcon(m.moveType)}
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{m.moveType}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300">
                          Alat: {m.equipmentCode || 'TOS'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mb-2 bg-slate-900/60 p-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">{m.fromLocation}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-cyan-300 font-semibold">{m.toLocation}</span>
                    </div>

                    {m.notes && <p className="text-xs text-slate-400 mt-1">{m.notes}</p>}

                    <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-900">
                      <span>Petugas / Operator: <strong className="text-slate-300">{m.operatorName}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Terverifikasi Sistem
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
          >
            Tutup Pelacakan
          </button>
        </div>
      </div>
    </div>
  );
};
