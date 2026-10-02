import React, { useState } from 'react';
import { VesselCall, Vessel, Berth } from '../types';
import { saveVesselCall, deleteVesselCall } from '../services/terminalService';
import {
  Ship,
  Anchor,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  X,
  Gauge,
} from 'lucide-react';

interface VesselCallsManagerProps {
  vesselCalls: VesselCall[];
  vessels: Vessel[];
  berths: Berth[];
}

export const VesselCallsManager: React.FC<VesselCallsManagerProps> = ({
  vesselCalls,
  vessels,
  berths,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingCall, setEditingCall] = useState<Partial<VesselCall> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCalls = vesselCalls.filter((c) => {
    const matchesSearch =
      c.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.voyageIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.berthCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCall?.vesselName || !editingCall?.voyageIn || !editingCall?.berthCode) return;
    setIsSaving(true);
    try {
      await saveVesselCall({
        vesselId: editingCall.vesselId || '',
        vesselName: editingCall.vesselName,
        voyageIn: editingCall.voyageIn,
        voyageOut: editingCall.voyageOut || editingCall.voyageIn,
        berthCode: editingCall.berthCode,
        eta: editingCall.eta || new Date().toISOString().slice(0, 16),
        etd: editingCall.etd || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        ata: editingCall.ata || '',
        atd: editingCall.atd || '',
        status: editingCall.status || 'Scheduled',
        targetDischarge: Number(editingCall.targetDischarge) || 0,
        completedDischarge: Number(editingCall.completedDischarge) || 0,
        targetLoad: Number(editingCall.targetLoad) || 0,
        completedLoad: Number(editingCall.completedLoad) || 0,
        assignedCranes: editingCall.assignedCranes || 'STS-01',
        grossCraneRate: Number(editingCall.grossCraneRate) || 28.0,
        id: editingCall.id,
      });
      setEditingCall(null);
    } catch (err: any) {
      alert('Gagal menyimpan jadwal kapal: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (call: VesselCall) => {
    if (confirm(`Hapus kunjungan kapal ${call.vesselName} (${call.voyageIn})?`)) {
      try {
        await deleteVesselCall(call.id);
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleQuickStatusChange = async (call: VesselCall, newStatus: VesselCall['status']) => {
    try {
      const now = new Date().toISOString().slice(0, 16);
      const updateData: Partial<VesselCall> = {
        ...call,
        status: newStatus,
      };
      if (newStatus === 'At Berth' && !call.ata) {
        updateData.ata = now;
      } else if (newStatus === 'Departed' && !call.atd) {
        updateData.atd = now;
      }
      await saveVesselCall(updateData as any);
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Jadwal Sandar & Kunjungan Kapal (Vessel Calls)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen alokasi dermaga, perkiraan kedatangan (ETA/ETD), dan kemajuan bongkar muat kapal (Stevedoring)
          </p>
        </div>

        <button
          onClick={() => {
            const firstVessel = vessels[0]?.name || '';
            const firstBerth = berths[0]?.code || 'BERTH-01';
            setEditingCall({
              vesselName: firstVessel,
              voyageIn: 'V.' + Math.floor(1000 + Math.random() * 9000),
              voyageOut: 'V.' + Math.floor(1000 + Math.random() * 9000),
              berthCode: firstBerth,
              status: 'Scheduled',
              targetDischarge: 450,
              completedDischarge: 0,
              targetLoad: 380,
              completedLoad: 0,
              assignedCranes: 'STS-01, STS-02',
              grossCraneRate: 28.5,
              eta: new Date().toISOString().slice(0, 16),
              etd: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            });
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Jadwalkan Kunjungan Kapal</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kapal, nomor voyage, atau dermaga..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['ALL', 'Scheduled', 'At Berth', 'Working', 'Completed', 'Departed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCalls.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            Tidak ada jadwal kunjungan kapal yang ditemukan.
          </div>
        ) : (
          filteredCalls.map((call) => {
            const progressDischarge = Math.round(
              ((call.completedDischarge || 0) / (call.targetDischarge || 1)) * 100
            );
            const progressLoad = Math.round(((call.completedLoad || 0) / (call.targetLoad || 1)) * 100);

            const getStatusColor = (status: string) => {
              switch (status) {
                case 'Working':
                  return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
                case 'At Berth':
                  return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                case 'Scheduled':
                  return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                case 'Completed':
                  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                case 'Departed':
                  return 'bg-slate-700/40 text-slate-400 border-slate-700';
                default:
                  return 'bg-slate-800 text-slate-300 border-slate-700';
              }
            };

            return (
              <div
                key={call.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{call.vesselName}</h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Voy In: {call.voyageIn} &bull; Out: {call.voyageOut}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 mb-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Dermaga Tambat</span>
                      <span className="font-mono font-bold text-cyan-300">{call.berthCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Crane STS</span>
                      <span className="font-mono text-slate-300 text-[11px]">{call.assignedCranes}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">ETA</span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        {call.eta ? new Date(call.eta).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">ETD</span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        {call.etd ? new Date(call.etd).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Discharge & Load Progress */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Bongkar (Discharge)</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          {call.completedDischarge} / {call.targetDischarge} ({progressDischarge}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, progressDischarge)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Muat (Load)</span>
                        <span className="font-mono text-blue-300 font-bold">
                          {call.completedLoad} / {call.targetLoad} ({progressLoad}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, progressLoad)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {call.status !== 'Working' && call.status !== 'Completed' && call.status !== 'Departed' && (
                      <button
                        onClick={() => handleQuickStatusChange(call, 'Working')}
                        className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition cursor-pointer"
                      >
                        Mulai Bongkar Muat
                      </button>
                    )}
                    {call.status === 'Working' && (
                      <button
                        onClick={() => handleQuickStatusChange(call, 'Completed')}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 transition cursor-pointer"
                      >
                        Selesai Operasi
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCall(call)}
                      title="Edit Detail Jadwal"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(call)}
                      title="Hapus Jadwal"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD / EDIT VESSEL CALL */}
      {editingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <span>{editingCall.id ? 'Edit Kunjungan Kapal' : 'Jadwalkan Kunjungan Kapal Baru'}</span>
              </h3>
              <button onClick={() => setEditingCall(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kapal</label>
                  <input
                    type="text"
                    required
                    value={editingCall.vesselName || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, vesselName: e.target.value })}
                    placeholder="MV SAMUDERA INDONESIA 01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voyage In</label>
                  <input
                    type="text"
                    required
                    value={editingCall.voyageIn || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, voyageIn: e.target.value })}
                    placeholder="V.2601I"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voyage Out</label>
                  <input
                    type="text"
                    value={editingCall.voyageOut || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, voyageOut: e.target.value })}
                    placeholder="V.2602O"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alokasi Dermaga (Berth)</label>
                  <select
                    value={editingCall.berthCode || (berths[0]?.code || 'BERTH-01')}
                    onChange={(e) => setEditingCall({ ...editingCall, berthCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    {berths.map((b) => (
                      <option key={b.id} value={b.code}>
                        {b.code} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kunjungan</label>
                  <select
                    value={editingCall.status || 'Scheduled'}
                    onChange={(e) => setEditingCall({ ...editingCall, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Scheduled">Scheduled (Terjadwal)</option>
                    <option value="Anchorage">Anchorage (Tunggu di Kolam Labuh)</option>
                    <option value="At Berth">At Berth (Sudah Sandar)</option>
                    <option value="Working">Working (Bongkar Muat)</option>
                    <option value="Completed">Completed (Selesai)</option>
                    <option value="Departed">Departed (Berangkat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ETA (Perkiraan Tiba)</label>
                  <input
                    type="datetime-local"
                    value={editingCall.eta || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, eta: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ETD (Perkiraan Berangkat)</label>
                  <input
                    type="datetime-local"
                    value={editingCall.etd || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, etd: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Bongkar (Box)</label>
                  <input
                    type="number"
                    value={editingCall.targetDischarge || 0}
                    onChange={(e) => setEditingCall({ ...editingCall, targetDischarge: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selesai Bongkar</label>
                  <input
                    type="number"
                    value={editingCall.completedDischarge || 0}
                    onChange={(e) => setEditingCall({ ...editingCall, completedDischarge: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Muat (Box)</label>
                  <input
                    type="number"
                    value={editingCall.targetLoad || 0}
                    onChange={(e) => setEditingCall({ ...editingCall, targetLoad: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selesai Muat</label>
                  <input
                    type="number"
                    value={editingCall.completedLoad || 0}
                    onChange={(e) => setEditingCall({ ...editingCall, completedLoad: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alokasi Crane</label>
                  <input
                    type="text"
                    value={editingCall.assignedCranes || ''}
                    onChange={(e) => setEditingCall({ ...editingCall, assignedCranes: e.target.value })}
                    placeholder="STS-01, STS-02"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Produktivitas Crane (Box/Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingCall.grossCraneRate || 28.5}
                    onChange={(e) => setEditingCall({ ...editingCall, grossCraneRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCall(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Kunjungan Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
