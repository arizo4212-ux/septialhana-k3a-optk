import React, { useState } from 'react';
import { VesselCall, Container, ContainerMove, Equipment } from '../types';
import {
  saveVesselCall,
  recordContainerMove,
  saveContainer,
  addNotification,
} from '../services/terminalService';
import {
  Ship,
  Box,
  Layers,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface StevedoringManagerProps {
  vesselCalls: VesselCall[];
  containers: Container[];
  containerMoves: ContainerMove[];
  equipment: Equipment[];
  operatorName?: string;
  onSelectContainerForTracking: (c: Container) => void;
}

export const StevedoringManager: React.FC<StevedoringManagerProps> = ({
  vesselCalls,
  containers,
  containerMoves,
  equipment,
  operatorName = 'Operator STS Crane',
  onSelectContainerForTracking,
}) => {
  const activeCalls = vesselCalls.filter(
    (c) => c.status === 'Working' || c.status === 'At Berth'
  );

  const [selectedCallId, setSelectedCallId] = useState<string>(activeCalls[0]?.id || '');
  const [moveType, setMoveType] = useState<'Discharge' | 'Load'>('Discharge');
  const [containerNo, setContainerNo] = useState('');
  const [selectedCrane, setSelectedCrane] = useState('STS-01');
  const [notes, setNotes] = useState('Bongkar normal, kondisi palka aman');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCall = vesselCalls.find((c) => c.id === selectedCallId);

  const handleRecordStevedoreMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNo || !currentCall) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const cleanCntr = containerNo.toUpperCase().replace(/\s+/g, '');

      // 1. Record container move
      await recordContainerMove({
        containerNo: cleanCntr,
        moveType,
        fromLocation: moveType === 'Discharge' ? `${currentCall.vesselName} (Palka)` : 'Yard Terminal',
        toLocation: moveType === 'Discharge' ? `Dermaga ${currentCall.berthCode} / Head Truck` : `${currentCall.vesselName} (Palka)`,
        equipmentCode: selectedCrane,
        operatorName,
        timestamp: now,
        notes: `${notes} [Kapal: ${currentCall.vesselName}]`,
      });

      // 2. Update Vessel Call count
      const updatedCall = {
        ...currentCall,
        completedDischarge:
          moveType === 'Discharge'
            ? (currentCall.completedDischarge || 0) + 1
            : currentCall.completedDischarge,
        completedLoad:
          moveType === 'Load'
            ? (currentCall.completedLoad || 0) + 1
            : currentCall.completedLoad,
      };
      await saveVesselCall(updatedCall);

      // 3. Update or create container status
      const existing = containers.find((c) => c.containerNo === cleanCntr);
      if (existing) {
        await saveContainer(
          {
            ...existing,
            status: moveType === 'Discharge' ? 'In-Yard' : 'Outbound-Vessel',
            vesselName: currentCall.vesselName,
            vesselCallId: currentCall.id,
          },
          operatorName
        );
      } else {
        // Register container if new
        await saveContainer(
          {
            containerNo: cleanCntr,
            size: '40ft',
            type: 'Dry',
            status: moveType === 'Discharge' ? 'In-Yard' : 'Outbound-Vessel',
            yardBlock: 'A',
            yardBay: '02',
            yardRow: '01',
            yardTier: '1',
            grossWeightKg: 25000,
            sealNo: 'SM-' + Math.floor(100000 + Math.random() * 900000),
            shippingLine: 'Samudera Indonesia',
            vesselName: currentCall.vesselName,
            vesselCallId: currentCall.id,
            dwellDays: 1,
            createdAt: now,
            updatedAt: now,
          },
          operatorName
        );
      }

      // 4. Send operational notification
      await addNotification({
        title: `Gerakan Crane ${selectedCrane}`,
        message: `${moveType} box ${cleanCntr} pada ${currentCall.vesselName} selesai. Total progres bertambah.`,
        category: 'Crane',
        severity: 'success',
        timestamp: now,
        read: false,
      });

      setContainerNo('');
    } catch (err: any) {
      alert('Gagal mencatat gerakan crane: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentStevedoringMoves = containerMoves.filter(
    (m) => m.moveType === 'Discharge' || m.moveType === 'Load'
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-black text-white">Operasi Bongkar Muat (Stevedoring & Quay Crane)</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pencatatan real-time pergerakan kontainer dari kapal ke lapangan atau sebaliknya menggunakan Quay Crane (STS)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Record Move */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Input Gerakan Bongkar Muat</h3>
          </div>

          {activeCalls.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada kapal yang sedang berstatus 'Working' atau 'At Berth'. Silakan ubah status kapal di tab Jadwal Sandar.
            </div>
          ) : (
            <form onSubmit={handleRecordStevedoreMove} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Kapal Sandar</label>
                <select
                  value={selectedCallId}
                  onChange={(e) => setSelectedCallId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                >
                  {activeCalls.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.vesselName} ({c.berthCode}) - Voy: {c.voyageIn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Operasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMoveType('Discharge');
                      setNotes('Bongkar kontainer dari palka kapal ke dermaga');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      moveType === 'Discharge'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Bongkar (Discharge)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoveType('Load');
                      setNotes('Muat kontainer dari yard ke palka kapal');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      moveType === 'Load'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Muat (Load)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Peti Kemas (Container No)</label>
                <input
                  type="text"
                  required
                  value={containerNo}
                  onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                  placeholder="MSKU8841023 atau ketik nomor baru"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alat Crane STS</label>
                <select
                  value={selectedCrane}
                  onChange={(e) => setSelectedCrane(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="STS-01">STS-01 (Quay Crane 01)</option>
                  <option value="STS-02">STS-02 (Quay Crane 02)</option>
                  <option value="STS-03">STS-03 (Quay Crane 03)</option>
                  <option value="STS-04">STS-04 (Megamax Quay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Gerakan (Notes)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Mencatat...' : 'Konfirmasi Box Selesai'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right 2 cols: Progress of active ship & Live stevedore history */}
        <div className="lg:col-span-2 space-y-6">
          {currentCall && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ship className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">{currentCall.vesselName}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Dermaga: {currentCall.berthCode} &bull; Voy: {currentCall.voyageIn}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Produktivitas Crane</span>
                  <strong className="text-emerald-400 text-base font-bold font-mono">
                    {currentCall.grossCraneRate || 28.5} Box/Jam
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">Bongkar (Discharge)</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {currentCall.completedDischarge} / {currentCall.targetDischarge} Box
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((currentCall.completedDischarge || 0) / (currentCall.targetDischarge || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">Muat (Load)</span>
                    <span className="font-mono text-blue-300 font-bold">
                      {currentCall.completedLoad} / {currentCall.targetLoad} Box
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((currentCall.completedLoad || 0) / (currentCall.targetLoad || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent stevedore moves */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Log Gerakan Bongkar Muat Terkini:
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recentStevedoringMoves.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">Belum ada gerakan bongkar muat</div>
              ) : (
                recentStevedoringMoves.slice(0, 10).map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          m.moveType === 'Discharge'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {m.moveType}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-white">{m.containerNo}</div>
                        <div className="text-[10px] text-slate-500">
                          {m.fromLocation} &rarr; {m.toLocation}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">Alat: {m.equipmentCode}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
