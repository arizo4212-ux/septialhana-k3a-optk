import React, { useState } from 'react';
import { Vessel, Berth, Equipment } from '../types';
import {
  saveVessel,
  deleteVessel,
  saveBerth,
  deleteBerth,
  saveEquipment,
  deleteEquipment,
} from '../services/terminalService';
import {
  Ship,
  Anchor,
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';

interface MasterDataManagerProps {
  vessels: Vessel[];
  berths: Berth[];
  equipment: Equipment[];
  userRole?: string;
}

export const MasterDataManager: React.FC<MasterDataManagerProps> = ({
  vessels,
  berths,
  equipment,
  userRole,
}) => {
  const [subTab, setSubTab] = useState<'vessels' | 'berths' | 'equipment'>('vessels');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for CRUD
  const [editingVessel, setEditingVessel] = useState<Partial<Vessel> | null>(null);
  const [editingBerth, setEditingBerth] = useState<Partial<Berth> | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Vessel form submit
  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVessel?.name || !editingVessel?.imoNumber) return;
    setIsSaving(true);
    try {
      await saveVessel({
        name: editingVessel.name,
        callSign: editingVessel.callSign || '',
        imoNumber: editingVessel.imoNumber,
        flag: editingVessel.flag || 'Indonesia (ID)',
        capacityTeu: Number(editingVessel.capacityTeu) || 1000,
        loaMeters: Number(editingVessel.loaMeters) || 150,
        shippingLine: editingVessel.shippingLine || 'Samudera Indonesia',
        status: editingVessel.status || 'Active',
        id: editingVessel.id,
      });
      alert(`Master kapal "${editingVessel.name}" berhasil disimpan ke database!`);
      setEditingVessel(null);
    } catch (err: any) {
      alert('Gagal menyimpan kapal: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVessel = async (vessel: Vessel) => {
    if (confirm(`Yakin ingin menghapus master kapal "${vessel.name}"?`)) {
      try {
        await deleteVessel(vessel.id);
        alert(`Master kapal "${vessel.name}" berhasil dihapus.`);
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  // Berth form submit
  const handleSaveBerth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBerth?.code || !editingBerth?.name) return;
    setIsSaving(true);
    try {
      await saveBerth({
        code: editingBerth.code,
        name: editingBerth.name,
        lengthMeters: Number(editingBerth.lengthMeters) || 300,
        maxDraftMeters: Number(editingBerth.maxDraftMeters) || 12,
        cranes: editingBerth.cranes || 'STS-01',
        status: editingBerth.status || 'Available',
        id: editingBerth.id,
      });
      alert(`Dermaga "${editingBerth.code}" berhasil disimpan ke database!`);
      setEditingBerth(null);
    } catch (err: any) {
      alert('Gagal menyimpan dermaga: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBerth = async (berth: Berth) => {
    if (confirm(`Hapus dermaga "${berth.code} - ${berth.name}"?`)) {
      try {
        await deleteBerth(berth.id);
        alert(`Dermaga "${berth.code}" berhasil dihapus.`);
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  // Equipment form submit
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment?.code || !editingEquipment?.name) return;
    setIsSaving(true);
    try {
      await saveEquipment({
        code: editingEquipment.code,
        name: editingEquipment.name,
        type: editingEquipment.type || 'STS Crane',
        status: editingEquipment.status || 'Operational',
        operatorName: editingEquipment.operatorName || 'Petugas',
        totalMoves: Number(editingEquipment.totalMoves) || 0,
        id: editingEquipment.id,
      });
      alert(`Alat berat "${editingEquipment.code}" berhasil disimpan ke database!`);
      setEditingEquipment(null);
    } catch (err: any) {
      alert('Gagal menyimpan alat berat: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEquipment = async (eq: Equipment) => {
    if (confirm(`Hapus alat berat "${eq.code}"?`)) {
      try {
        await deleteEquipment(eq.id);
        alert(`Alat berat "${eq.code}" berhasil dihapus.`);
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  // Filtered vessels
  const filteredVessels = vessels.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imoNumber?.includes(searchTerm) ||
      v.shippingLine?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered berths
  const filteredBerths = berths.filter(
    (b) =>
      b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered equipment
  const filteredEquipment = equipment.filter(
    (e) =>
      e.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Title & SubTab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Master Data Terminal</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen master kapal kontainer, dermaga tambat, dan armada alat berat (CRUD Online)
          </p>
        </div>

        {/* Subtabs switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setSubTab('vessels'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'vessels' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Master Kapal ({vessels.length})</span>
          </button>
          <button
            onClick={() => { setSubTab('berths'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'berths' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Dermaga / Berth ({berths.length})</span>
          </button>
          <button
            onClick={() => { setSubTab('equipment'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'equipment' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Alat Berat ({equipment.length})</span>
          </button>
        </div>
      </div>

      {/* Action Bar (Search + Add Button) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari ${subTab === 'vessels' ? 'nama kapal, IMO...' : subTab === 'berths' ? 'kode dermaga...' : 'kode alat berat...'}`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
        </div>

        <button
          onClick={() => {
            if (subTab === 'vessels') setEditingVessel({ status: 'Active', capacityTeu: 2000, loaMeters: 180, flag: 'Indonesia (ID)' });
            if (subTab === 'berths') setEditingBerth({ status: 'Available', lengthMeters: 350, maxDraftMeters: 14.5 });
            if (subTab === 'equipment') setEditingEquipment({ status: 'Operational', type: 'STS Crane', totalMoves: 0 });
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            {subTab === 'vessels' ? '+ Tambah Kapal Baru' : subTab === 'berths' ? '+ Tambah Dermaga' : '+ Tambah Alat Berat'}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: VESSELS TABLE */}
      {subTab === 'vessels' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Kapal & Shipping Line</th>
                  <th className="py-3 px-4">IMO / Call Sign</th>
                  <th className="py-3 px-4">Bendera</th>
                  <th className="py-3 px-4">Kapasitas TEU</th>
                  <th className="py-3 px-4">Panjang (LOA)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredVessels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Tidak ada data kapal yang sesuai
                    </td>
                  </tr>
                ) : (
                  filteredVessels.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-bold">{v.name}</div>
                            <div className="text-[10px] text-slate-400">{v.shippingLine}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        IMO: {v.imoNumber} <br />
                        <span className="text-[10px] text-slate-500">CS: {v.callSign || '-'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{v.flag}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {v.capacityTeu.toLocaleString()} TEU
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{v.loaMeters} m</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            v.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingVessel(v)}
                            title="Edit Kapal"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVessel(v)}
                            title="Hapus Kapal"
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
      )}

      {/* SUBTAB 2: BERTHS TABLE */}
      {subTab === 'berths' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Dermaga</th>
                  <th className="py-3 px-4">Panjang (Length)</th>
                  <th className="py-3 px-4">Kedalaman Maks (Draft)</th>
                  <th className="py-3 px-4">Alat Bongkar Muat (Cranes)</th>
                  <th className="py-3 px-4">Status Dermaga</th>
                  <th className="py-3 px-4 text-right">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredBerths.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data dermaga
                    </td>
                  </tr>
                ) : (
                  filteredBerths.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-bold">{b.code}</div>
                            <div className="text-[10px] text-slate-400">{b.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{b.lengthMeters} meter</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{b.maxDraftMeters} meter</td>
                      <td className="py-3.5 px-4 text-cyan-300 font-mono">{b.cranes}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            b.status === 'Occupied'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : b.status === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingBerth(b)}
                            title="Edit Dermaga"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBerth(b)}
                            title="Hapus Dermaga"
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
      )}

      {/* SUBTAB 3: EQUIPMENT TABLE */}
      {subTab === 'equipment' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Kode & Deskripsi Alat</th>
                  <th className="py-3 px-4">Jenis Alat (Type)</th>
                  <th className="py-3 px-4">Operator Bertugas</th>
                  <th className="py-3 px-4">Total Gerakan (Moves)</th>
                  <th className="py-3 px-4">Status Operasi</th>
                  <th className="py-3 px-4 text-right">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data alat berat
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-bold">{eq.code}</div>
                            <div className="text-[10px] text-slate-400">{eq.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{eq.type}</td>
                      <td className="py-3.5 px-4 text-slate-300">{eq.operatorName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {eq.totalMoves.toLocaleString()} Moves
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            eq.status === 'Operational'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : eq.status === 'Standby'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingEquipment(eq)}
                            title="Edit Alat"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(eq)}
                            title="Hapus Alat"
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
      )}

      {/* MODAL: ADD/EDIT VESSEL */}
      {editingVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <span>{editingVessel.id ? 'Edit Master Kapal' : 'Tambah Master Kapal Baru'}</span>
              </h3>
              <button onClick={() => setEditingVessel(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVessel} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Kapal</label>
                  <input
                    type="text"
                    required
                    value={editingVessel.name || ''}
                    onChange={(e) => setEditingVessel({ ...editingVessel, name: e.target.value })}
                    placeholder="Contoh: MV SAMUDERA INDONESIA 01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor IMO</label>
                  <input
                    type="text"
                    required
                    value={editingVessel.imoNumber || ''}
                    onChange={(e) => setEditingVessel({ ...editingVessel, imoNumber: e.target.value })}
                    placeholder="9421832"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Call Sign</label>
                  <input
                    type="text"
                    value={editingVessel.callSign || ''}
                    onChange={(e) => setEditingVessel({ ...editingVessel, callSign: e.target.value })}
                    placeholder="YDYP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shipping Line / Operator</label>
                  <input
                    type="text"
                    required
                    value={editingVessel.shippingLine || ''}
                    onChange={(e) => setEditingVessel({ ...editingVessel, shippingLine: e.target.value })}
                    placeholder="Samudera Indonesia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Negara Bendera (Flag)</label>
                  <input
                    type="text"
                    value={editingVessel.flag || ''}
                    onChange={(e) => setEditingVessel({ ...editingVessel, flag: e.target.value })}
                    placeholder="Indonesia (ID)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kapasitas (TEU)</label>
                  <input
                    type="number"
                    value={editingVessel.capacityTeu || 0}
                    onChange={(e) => setEditingVessel({ ...editingVessel, capacityTeu: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Panjang LOA (Meter)</label>
                  <input
                    type="number"
                    value={editingVessel.loaMeters || 0}
                    onChange={(e) => setEditingVessel({ ...editingVessel, loaMeters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Operasional</label>
                  <select
                    value={editingVessel.status || 'Active'}
                    onChange={(e) => setEditingVessel({ ...editingVessel, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Active">Active (Beroperasi)</option>
                    <option value="In Maintenance">In Maintenance (Docking / Perbaikan)</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVessel(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Master Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT BERTH */}
      {editingBerth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <span>{editingBerth.id ? 'Edit Dermaga' : 'Tambah Dermaga Baru'}</span>
              </h3>
              <button onClick={() => setEditingBerth(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBerth} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Dermaga</label>
                <input
                  type="text"
                  required
                  value={editingBerth.code || ''}
                  onChange={(e) => setEditingBerth({ ...editingBerth, code: e.target.value.toUpperCase() })}
                  placeholder="BERTH-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Dermaga</label>
                <input
                  type="text"
                  required
                  value={editingBerth.name || ''}
                  onChange={(e) => setEditingBerth({ ...editingBerth, name: e.target.value })}
                  placeholder="Dermaga Peti Kemas Utara 01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Panjang (m)</label>
                  <input
                    type="number"
                    value={editingBerth.lengthMeters || 0}
                    onChange={(e) => setEditingBerth({ ...editingBerth, lengthMeters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Draft (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBerth.maxDraftMeters || 0}
                    onChange={(e) => setEditingBerth({ ...editingBerth, maxDraftMeters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alat Crane Terpasang</label>
                <input
                  type="text"
                  value={editingBerth.cranes || ''}
                  onChange={(e) => setEditingBerth({ ...editingBerth, cranes: e.target.value })}
                  placeholder="STS-01, STS-02"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status Dermaga</label>
                <select
                  value={editingBerth.status || 'Available'}
                  onChange={(e) => setEditingBerth({ ...editingBerth, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="Available">Available (Tersedia)</option>
                  <option value="Occupied">Occupied (Sedang Digunakan Kapal)</option>
                  <option value="Maintenance">Maintenance (Dalam Perbaikan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBerth(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Dermaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT EQUIPMENT */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>{editingEquipment.id ? 'Edit Alat Berat' : 'Tambah Alat Berat Baru'}</span>
              </h3>
              <button onClick={() => setEditingEquipment(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Alat</label>
                <input
                  type="text"
                  required
                  value={editingEquipment.code || ''}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, code: e.target.value.toUpperCase() })}
                  placeholder="STS-01 atau RTG-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Nama Alat</label>
                <input
                  type="text"
                  required
                  value={editingEquipment.name || ''}
                  onChange={(e) => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                  placeholder="Super Post-Panamax Quay Crane"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipe Alat</label>
                  <select
                    value={editingEquipment.type || 'STS Crane'}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="STS Crane">STS Crane (Quay)</option>
                    <option value="RTG Crane">RTG Crane (Yard)</option>
                    <option value="Reach Stacker">Reach Stacker</option>
                    <option value="Head Truck">Head Truck / Chassis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Alat</label>
                  <select
                    value={editingEquipment.status || 'Operational'}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="Operational">Operational (Aktif)</option>
                    <option value="Standby">Standby (Siaga)</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Breakdown">Breakdown (Rusak)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Operator Bertugas</label>
                  <input
                    type="text"
                    value={editingEquipment.operatorName || ''}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, operatorName: e.target.value })}
                    placeholder="Nama Operator"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Moves</label>
                  <input
                    type="number"
                    value={editingEquipment.totalMoves || 0}
                    onChange={(e) => setEditingEquipment({ ...editingEquipment, totalMoves: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEquipment(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition shadow-md cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
