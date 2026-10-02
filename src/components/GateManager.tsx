import React, { useState } from 'react';
import { GateRecord, Container } from '../types';
import { saveGateRecord, saveContainer, recordContainerMove } from '../services/terminalService';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Printer,
  X,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface GateManagerProps {
  gateRecords: GateRecord[];
  containers: Container[];
  operatorName?: string;
}

export const GateManager: React.FC<GateManagerProps> = ({
  gateRecords,
  containers,
  operatorName = 'Petugas Gate',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'Gate-In' | 'Gate-Out'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketToPrint, setSelectedTicketToPrint] = useState<GateRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [ticketForm, setTicketForm] = useState<Partial<GateRecord>>({
    direction: 'Gate-In',
    containerNo: '',
    truckPlate: '',
    driverName: '',
    deliveryOrderNo: '',
    sealStatus: 'Intact',
    physicalCondition: 'Good',
    gatePassStatus: 'Approved',
    turnaroundMinutes: 15,
  });

  const filteredRecords = gateRecords.filter((r) => {
    const matchesSearch =
      r.ticketNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.containerNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.truckPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDir = directionFilter === 'ALL' || r.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  const handleCreateGateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.containerNo || !ticketForm.truckPlate || !ticketForm.driverName) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const ticketNo = `GTK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const cleanContainerNo = ticketForm.containerNo.toUpperCase().replace(/\s+/g, '');

      // 1. Save Gate Record
      await saveGateRecord({
        ticketNo,
        containerNo: cleanContainerNo,
        truckPlate: ticketForm.truckPlate.toUpperCase(),
        driverName: ticketForm.driverName,
        direction: ticketForm.direction || 'Gate-In',
        deliveryOrderNo: ticketForm.deliveryOrderNo || `DO-${Math.floor(10000 + Math.random() * 90000)}`,
        sealStatus: ticketForm.sealStatus || 'Intact',
        physicalCondition: ticketForm.physicalCondition || 'Good',
        gatePassStatus: ticketForm.gatePassStatus || 'Approved',
        turnaroundMinutes: Number(ticketForm.turnaroundMinutes) || 15,
        timestamp: now,
      });

      // 2. Automatically log movement to container tracking
      await recordContainerMove({
        containerNo: cleanContainerNo,
        moveType: ticketForm.direction === 'Gate-In' ? 'Gate-In' : 'Gate-Out',
        fromLocation: ticketForm.direction === 'Gate-In' ? `Truk ${ticketForm.truckPlate}` : 'Yard Terminal',
        toLocation: ticketForm.direction === 'Gate-In' ? 'Terminal Gate In & Inspection' : `Customer / Truk ${ticketForm.truckPlate}`,
        equipmentCode: 'Gate-Lane-01',
        operatorName,
        timestamp: now,
        notes: `Pemeriksaan gerbang: Segel ${ticketForm.sealStatus}, Kondisi ${ticketForm.physicalCondition}. Tiket: ${ticketNo}`,
      });

      // 3. Update container status if exists
      const existingCntr = containers.find((c) => c.containerNo === cleanContainerNo);
      if (existingCntr) {
        await saveContainer({
          ...existingCntr,
          status: ticketForm.direction === 'Gate-In' ? 'In-Yard' : 'Gated-Out',
        }, operatorName);
      }

      setShowCreateModal(false);
      setTicketForm({
        direction: 'Gate-In',
        containerNo: '',
        truckPlate: '',
        driverName: '',
        deliveryOrderNo: '',
        sealStatus: 'Intact',
        physicalCondition: 'Good',
        gatePassStatus: 'Approved',
        turnaroundMinutes: 15,
      });
    } catch (err: any) {
      alert('Gagal membuat tiket gate: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Transaksi Gerbang Truk (Gate In & Gate Out)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan truk kontainer masuk/keluar, verifikasi segel, pemeriksaan fisik, dan penerbitan Surat Jalan Gate Pass
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Tiket Gate Masuk/Keluar</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor tiket, plat truk, driver, atau kontainer..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(['ALL', 'Gate-In', 'Gate-Out'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                directionFilter === dir
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dir === 'ALL' ? 'Semua Arus' : dir}
            </button>
          ))}
        </div>
      </div>

      {/* Table Records */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Arah</th>
                <th className="py-3.5 px-4">Nomor Kontainer</th>
                <th className="py-3.5 px-4">Plat Truk & Supir</th>
                <th className="py-3.5 px-4">Delivery Order (DO)</th>
                <th className="py-3.5 px-4">Status Segel</th>
                <th className="py-3.5 px-4">Kondisi Fisik</th>
                <th className="py-3.5 px-4">Turnaround</th>
                <th className="py-3.5 px-4 text-right">Gate Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Belum ada transaksi gate yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-mono font-bold text-white text-xs">{rec.ticketNo}</div>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border mt-0.5 ${
                              rec.direction === 'Gate-In'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {rec.direction}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{rec.containerNo}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-200">{rec.truckPlate}</div>
                      <div className="text-[10px] text-slate-400">{rec.driverName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{rec.deliveryOrderNo || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rec.sealStatus === 'Intact'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {rec.sealStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rec.physicalCondition === 'Good'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : rec.physicalCondition === 'Minor Damage'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {rec.physicalCondition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{rec.turnaroundMinutes || 15} Menit</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicketToPrint(rec)}
                        title="Cetak Tiket Gate Pass"
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Tiket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE GATE TICKET */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>Registrasi Tiket Gerbang (Gate Pass)</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGateRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arah Gerbang</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, direction: 'Gate-In' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        ticketForm.direction === 'Gate-In'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Gate In (Truk Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, direction: 'Gate-Out' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        ticketForm.direction === 'Gate-Out'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Gate Out (Truk Keluar)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Peti Kemas</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.containerNo || ''}
                    onChange={(e) => setTicketForm({ ...ticketForm, containerNo: e.target.value })}
                    placeholder="MSKU8841023"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plat Nomor Truk</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.truckPlate || ''}
                    onChange={(e) => setTicketForm({ ...ticketForm, truckPlate: e.target.value.toUpperCase() })}
                    placeholder="B 9841 TPA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pengemudi / Supir</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.driverName || ''}
                    onChange={(e) => setTicketForm({ ...ticketForm, driverName: e.target.value })}
                    placeholder="Nama Supir Truk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Delivery Order (DO)</label>
                  <input
                    type="text"
                    value={ticketForm.deliveryOrderNo || ''}
                    onChange={(e) => setTicketForm({ ...ticketForm, deliveryOrderNo: e.target.value })}
                    placeholder="DO-SMD-90214"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kondisi Segel (Seal)</label>
                  <select
                    value={ticketForm.sealStatus || 'Intact'}
                    onChange={(e) => setTicketForm({ ...ticketForm, sealStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Intact">Intact (Segel Utuh)</option>
                    <option value="Broken">Broken (Segel Rusak)</option>
                    <option value="Missing">Missing (Segel Hilang)</option>
                    <option value="Replaced">Replaced (Diganti Baru)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kondisi Fisik Peti Kemas</label>
                  <select
                    value={ticketForm.physicalCondition || 'Good'}
                    onChange={(e) => setTicketForm({ ...ticketForm, physicalCondition: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Good">Good (Kondisi Baik/Mulus)</option>
                    <option value="Minor Damage">Minor Damage (Penyok Ringan)</option>
                    <option value="Severe Damage">Severe Damage (Rusak Berat / Bocor)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Cetak & Simpan Tiket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GATE PASS MODAL */}
      {selectedTicketToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                SURAT JALAN & TIKET GATE PASS RESMI
              </span>
              <button onClick={() => setSelectedTicketToPrint(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Pass Paper Style */}
            <div className="p-6 bg-slate-950/80 m-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-slate-700">
                <div className="font-extrabold text-sm text-cyan-400">PORT-OS CONTAINER TERMINAL</div>
                <div className="text-[10px] text-slate-400">GATE PASS TRANSAKSI RESMI</div>
                <div className="text-base font-bold text-white mt-1">{selectedTicketToPrint.ticketNo}</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Arah:</span>
                  <strong className="text-cyan-300 font-bold uppercase">{selectedTicketToPrint.direction}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kontainer:</span>
                  <strong className="text-white font-bold">{selectedTicketToPrint.containerNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plat Truk:</span>
                  <strong className="text-white">{selectedTicketToPrint.truckPlate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Supir:</span>
                  <strong className="text-white">{selectedTicketToPrint.driverName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Order:</span>
                  <strong className="text-slate-300">{selectedTicketToPrint.deliveryOrderNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Segel:</span>
                  <strong className="text-emerald-400">{selectedTicketToPrint.sealStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kondisi Fisik:</span>
                  <strong className="text-slate-200">{selectedTicketToPrint.physicalCondition}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu:</span>
                  <strong className="text-slate-300">{new Date(selectedTicketToPrint.timestamp).toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-700 text-center">
                <div className="inline-block p-2 bg-white rounded-xl mb-2">
                  <QrCode className="w-16 h-16 text-slate-950" />
                </div>
                <p className="text-[9px] text-slate-500">Scan QR Code di Gerbang Keluar & Pos Bea Cukai</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen</span>
              </button>
              <button
                onClick={() => setSelectedTicketToPrint(null)}
                className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
