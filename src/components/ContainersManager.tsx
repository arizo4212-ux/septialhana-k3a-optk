import React, { useState } from 'react';
import { Container, VesselCall } from '../types';
import { saveContainer, deleteContainer, recordContainerMove } from '../services/terminalService';
import {
  Box,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Move,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  X,
  Filter,
  Layers,
} from 'lucide-react';

interface ContainersManagerProps {
  containers: Container[];
  vesselCalls: VesselCall[];
  onSelectContainerForTracking: (c: Container) => void;
  operatorName?: string;
}

export const ContainersManager: React.FC<ContainersManagerProps> = ({
  containers,
  vesselCalls,
  onSelectContainerForTracking,
  operatorName = 'Operator Terminal',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');

  // Modal State
  const [editingContainer, setEditingContainer] = useState<Partial<Container> | null>(null);
  const [relocatingContainer, setRelocatingContainer] = useState<Container | null>(null);
  const [newYardBlock, setNewYardBlock] = useState('A');
  const [newYardBay, setNewYardBay] = useState('01');
  const [newYardRow, setNewYardRow] = useState('01');
  const [newYardTier, setNewYardTier] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  const filteredContainers = containers.filter((c) => {
    const matchesSearch =
      c.containerNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shippingLine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sealNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesBlock = blockFilter === 'ALL' || c.yardBlock === blockFilter;
    return matchesSearch && matchesStatus && matchesType && matchesBlock;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContainer?.containerNo) return;
    setIsSaving(true);
    try {
      await saveContainer(
        {
          containerNo: editingContainer.containerNo.toUpperCase().replace(/\s+/g, ''),
          size: editingContainer.size || '40ft',
          type: editingContainer.type || 'Dry',
          status: editingContainer.status || 'In-Yard',
          yardBlock: editingContainer.yardBlock || 'A',
          yardBay: editingContainer.yardBay || '01',
          yardRow: editingContainer.yardRow || '01',
          yardTier: editingContainer.yardTier || '1',
          grossWeightKg: Number(editingContainer.grossWeightKg) || 22000,
          sealNo: editingContainer.sealNo || 'SEAL-' + Math.floor(100000 + Math.random() * 900000),
          shippingLine: editingContainer.shippingLine || 'Samudera Indonesia',
          vesselCallId: editingContainer.vesselCallId || '',
          vesselName: editingContainer.vesselName || '',
          temperatureCelsius: editingContainer.type === 'Reefer' ? Number(editingContainer.temperatureCelsius) || -18 : undefined,
          dwellDays: Number(editingContainer.dwellDays) || 1,
          createdAt: editingContainer.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: editingContainer.id,
        },
        operatorName
      );
      setEditingContainer(null);
    } catch (err: any) {
      alert('Gagal menyimpan peti kemas: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (container: Container) => {
    if (confirm(`Hapus peti kemas ${container.containerNo}? Aksi ini akan menghapus data dari Firestore.`)) {
      try {
        await deleteContainer(container.id);
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleRelocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relocatingContainer) return;
    setIsSaving(true);
    try {
      const oldLocation = `${relocatingContainer.yardBlock}-${relocatingContainer.yardBay}-${relocatingContainer.yardRow}-${relocatingContainer.yardTier}`;
      const newLocation = `${newYardBlock}-${newYardBay}-${newYardRow}-${newYardTier}`;

      await saveContainer({
        ...relocatingContainer,
        yardBlock: newYardBlock,
        yardBay: newYardBay,
        yardRow: newYardRow,
        yardTier: newYardTier,
        status: 'In-Yard',
      }, operatorName);

      await recordContainerMove({
        containerNo: relocatingContainer.containerNo,
        moveType: 'Yard-Shifting',
        fromLocation: `Slot ${oldLocation}`,
        toLocation: `Slot ${newLocation}`,
        equipmentCode: 'RTG-01',
        operatorName,
        timestamp: new Date().toISOString(),
        notes: `Relokasi slot lapangan dari Blok ${relocatingContainer.yardBlock} ke Blok ${newYardBlock}`,
      });

      setRelocatingContainer(null);
      alert(`Peti kemas ${relocatingContainer.containerNo} berhasil dipindahkan ke Blok ${newYardBlock} (${newLocation})`);
    } catch (err: any) {
      alert('Gagal merelokasi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Reefer':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Hazmat/DG':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Tank':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Inventaris & Data Peti Kemas (Containers)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen status kontainer, pelacakan posisi slot yard, monitoring reefer, dan histori pergerakan
          </p>
        </div>

        <button
          onClick={() => {
            setEditingContainer({
              containerNo: 'TOS' + Math.floor(1000000 + Math.random() * 9000000),
              size: '40ft',
              type: 'Dry',
              status: 'In-Yard',
              yardBlock: 'A',
              yardBay: '01',
              yardRow: '01',
              yardTier: '1',
              grossWeightKg: 24500,
              sealNo: 'SL-' + Math.floor(100000 + Math.random() * 900000),
              shippingLine: 'Samudera Indonesia',
              dwellDays: 1,
            });
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Peti Kemas Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor kontainer (mis: SMCU...), shipping line, segel..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="In-Yard">In-Yard (Di Lapangan)</option>
              <option value="Inbound-Vessel">Inbound-Vessel</option>
              <option value="Outbound-Vessel">Outbound-Vessel</option>
              <option value="Gated-Out">Gated-Out (Keluar)</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="Dry">Dry Container</option>
              <option value="Reefer">Reefer Container</option>
              <option value="Hazmat/DG">Hazmat / DG</option>
              <option value="Tank">Tank Container</option>
            </select>

            {/* Block Filter */}
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Semua Blok</option>
              <option value="A">Blok A (Dry)</option>
              <option value="B">Blok B (Reefer)</option>
              <option value="C">Blok C (Empty)</option>
              <option value="D">Blok D (Hazmat)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Containers Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nomor Kontainer</th>
                <th className="py-3.5 px-4">Tipe & Ukuran</th>
                <th className="py-3.5 px-4">Posisi Yard Slot</th>
                <th className="py-3.5 px-4">Shipping Line & Segel</th>
                <th className="py-3.5 px-4">Berat Kotor</th>
                <th className="py-3.5 px-4">Status & Dwell</th>
                <th className="py-3.5 px-4 text-right">Aksi & Pelacakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada kontainer yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredContainers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-mono font-bold text-white text-sm">{c.containerNo}</div>
                          {c.vesselName && (
                            <div className="text-[10px] text-slate-400">Kapal: {c.vesselName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadgeColor(c.type)}`}>
                          {c.type}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{c.size}</span>
                      </div>
                      {c.type === 'Reefer' && c.temperatureCelsius !== undefined && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                          <Thermometer className="w-3 h-3" />
                          <span>{c.temperatureCelsius}°C</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        {c.yardBlock}-{c.yardBay}-{c.yardRow}-{c.yardTier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300">{c.shippingLine}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Segel: {c.sealNo || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {(c.grossWeightKg || 0).toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === 'In-Yard'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : c.status === 'Gated-Out'
                            ? 'bg-slate-700/50 text-slate-400 border-slate-600'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.dwellDays || 1} hari di terminal</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectContainerForTracking(c)}
                          title="Lihat Histori Pelacakan (Audit Trail)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setRelocatingContainer(c);
                            setNewYardBlock(c.yardBlock || 'A');
                            setNewYardBay(c.yardBay || '01');
                            setNewYardRow(c.yardRow || '01');
                            setNewYardTier(c.yardTier || '1');
                          }}
                          title="Pindahkan Slot Lapangan (Relocate)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                        >
                          <Move className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingContainer(c)}
                          title="Edit Peti Kemas"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Hapus Peti Kemas"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT CONTAINER */}
      {editingContainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-400" />
                <span>{editingContainer.id ? 'Edit Peti Kemas' : 'Tambah Peti Kemas Baru'}</span>
              </h3>
              <button onClick={() => setEditingContainer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Peti Kemas (Container No)</label>
                  <input
                    type="text"
                    required
                    value={editingContainer.containerNo || ''}
                    onChange={(e) => setEditingContainer({ ...editingContainer, containerNo: e.target.value.toUpperCase() })}
                    placeholder="MSKU1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ukuran</label>
                  <select
                    value={editingContainer.size || '40ft'}
                    onChange={(e) => setEditingContainer({ ...editingContainer, size: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="20ft">20 Feet</option>
                    <option value="40ft">40 Feet</option>
                    <option value="45ft">45 Feet High Cube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipe Peti Kemas</label>
                  <select
                    value={editingContainer.type || 'Dry'}
                    onChange={(e) => setEditingContainer({ ...editingContainer, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Dry">Dry (General)</option>
                    <option value="Reefer">Reefer (Pendingin)</option>
                    <option value="Hazmat/DG">Hazmat / DG</option>
                    <option value="Tank">Tank Container</option>
                    <option value="Open Top">Open Top</option>
                    <option value="Flat Rack">Flat Rack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shipping Line</label>
                  <input
                    type="text"
                    required
                    value={editingContainer.shippingLine || ''}
                    onChange={(e) => setEditingContainer({ ...editingContainer, shippingLine: e.target.value })}
                    placeholder="Samudera Indonesia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Segel (Seal No)</label>
                  <input
                    type="text"
                    value={editingContainer.sealNo || ''}
                    onChange={(e) => setEditingContainer({ ...editingContainer, sealNo: e.target.value })}
                    placeholder="SM-90219"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Yard Position Slot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Blok Yard</label>
                  <select
                    value={editingContainer.yardBlock || 'A'}
                    onChange={(e) => setEditingContainer({ ...editingContainer, yardBlock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="A">Blok A (Dry)</option>
                    <option value="B">Blok B (Reefer)</option>
                    <option value="C">Blok C (Empty)</option>
                    <option value="D">Blok D (Hazmat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bay - Row - Tier</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="text"
                      placeholder="Bay"
                      value={editingContainer.yardBay || '01'}
                      onChange={(e) => setEditingContainer({ ...editingContainer, yardBay: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-xs text-slate-100 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Row"
                      value={editingContainer.yardRow || '01'}
                      onChange={(e) => setEditingContainer({ ...editingContainer, yardRow: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-xs text-slate-100 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Tier"
                      value={editingContainer.yardTier || '1'}
                      onChange={(e) => setEditingContainer({ ...editingContainer, yardTier: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Berat Kotor (Gross kg)</label>
                  <input
                    type="number"
                    value={editingContainer.grossWeightKg || 0}
                    onChange={(e) => setEditingContainer({ ...editingContainer, grossWeightKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Keberadaan</label>
                  <select
                    value={editingContainer.status || 'In-Yard'}
                    onChange={(e) => setEditingContainer({ ...editingContainer, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="In-Yard">In-Yard (Di Lapangan)</option>
                    <option value="Inbound-Vessel">Inbound-Vessel (Sedang Dibongkar)</option>
                    <option value="Outbound-Vessel">Outbound-Vessel (Dimuat ke Kapal)</option>
                    <option value="Gated-Out">Gated-Out (Keluar Terminal)</option>
                  </select>
                </div>

                {editingContainer.type === 'Reefer' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Suhu Reefer (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingContainer.temperatureCelsius ?? -18}
                      onChange={(e) => setEditingContainer({ ...editingContainer, temperatureCelsius: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingContainer(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Peti Kemas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RELOCATE YARD SLOT */}
      {relocatingContainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Move className="w-5 h-5 text-amber-400" />
                <span>Pindahkan Slot Lapangan (Relocate)</span>
              </h3>
              <button onClick={() => setRelocatingContainer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRelocateSubmit} className="p-6 space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div className="text-slate-400 mb-1">Peti Kemas:</div>
                <div className="text-base font-mono font-bold text-white">{relocatingContainer.containerNo}</div>
                <div className="text-slate-500 mt-1">
                  Posisi saat ini:{' '}
                  <strong className="text-amber-400 font-mono">
                    Blok {relocatingContainer.yardBlock} ({relocatingContainer.yardBay}-{relocatingContainer.yardRow}-{relocatingContainer.yardTier})
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Blok Tujuan</label>
                <select
                  value={newYardBlock}
                  onChange={(e) => setNewYardBlock(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="A">Blok A (Dry General Cargo)</option>
                  <option value="B">Blok B (Reefer Stacking Yard)</option>
                  <option value="C">Blok C (Empty Depo)</option>
                  <option value="D">Blok D (Dangerous Goods DG/Hazmat)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bay</label>
                  <input
                    type="text"
                    value={newYardBay}
                    onChange={(e) => setNewYardBay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Row</label>
                  <input
                    type="text"
                    value={newYardRow}
                    onChange={(e) => setNewYardRow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tier</label>
                  <input
                    type="text"
                    value={newYardTier}
                    onChange={(e) => setNewYardTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRelocatingContainer(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer"
                >
                  {isSaving ? 'Memindahkan...' : 'Konfirmasi Pindah Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
