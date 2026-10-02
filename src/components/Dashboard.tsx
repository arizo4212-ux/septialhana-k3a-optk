import React from 'react';
import {
  Vessel,
  Berth,
  Equipment,
  VesselCall,
  Container,
  ContainerMove,
  GateRecord,
} from '../types';
import {
  Ship,
  Anchor,
  Box,
  Truck,
  Layers,
  Activity,
  ArrowUpRight,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  vessels: Vessel[];
  berths: Berth[];
  equipment: Equipment[];
  vesselCalls: VesselCall[];
  containers: Container[];
  containerMoves: ContainerMove[];
  gateRecords: GateRecord[];
  onNavigateTab: (tab: string) => void;
  onSelectContainer: (container: Container) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vessels,
  berths,
  equipment,
  vesselCalls,
  containers,
  containerMoves,
  gateRecords,
  onNavigateTab,
  onSelectContainer,
}) => {
  // Calculations
  const inYardContainers = containers.filter((c) => c.status === 'In-Yard');
  const activeVessels = vesselCalls.filter((v) => v.status === 'Working' || v.status === 'At Berth');
  const scheduledVessels = vesselCalls.filter((v) => v.status === 'Scheduled' || v.status === 'Anchorage');
  
  // Yard capacity estimation (e.g. 100 capacity base for visual)
  const totalSlotsCapacity = 120;
  const yorPercentage = Math.min(100, Math.round((inYardContainers.length / totalSlotsCapacity) * 100));

  // Average Crane Rate
  const activeCraneRates = vesselCalls
    .filter((v) => v.grossCraneRate && v.grossCraneRate > 0)
    .map((v) => v.grossCraneRate || 0);
  const avgCraneRate = activeCraneRates.length > 0
    ? (activeCraneRates.reduce((a, b) => a + b, 0) / activeCraneRates.length).toFixed(1)
    : '28.4';

  // Average Dwelling Time
  const avgDwell = containers.length > 0
    ? (containers.reduce((acc, c) => acc + (c.dwellDays || 1), 0) / containers.length).toFixed(1)
    : '2.5';

  // Average Truck Turnaround Time
  const avgTrt = gateRecords.length > 0
    ? Math.round(gateRecords.reduce((acc, g) => acc + (g.turnaroundMinutes || 15), 0) / gateRecords.length)
    : 16;

  // Equipment status breakdown
  const activeCranes = equipment.filter((e) => e.status === 'Operational');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Pusat Kendali Operasi Real-Time
              </span>
              <span className="text-slate-500 text-xs">&bull; Live Sync Firestore</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Dashboard Analitik Operasional Pelabuhan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Memantau utilisasi dermaga, produktivitas bongkar muat kapal, kapasitas lapangan penumpukan (yard), dan kelancaran arus gerbang secara terpadu.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('vesselCalls')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Ship className="w-4 h-4" />
              <span>Jadwal Sandar Kapal</span>
            </button>
            <button
              onClick={() => onNavigateTab('yard')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Peta Yard 2D</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total In-Yard */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Peti Kemas di Yard</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{inYardContainers.length}</span>
            <span className="text-xs text-slate-400 font-medium">Box</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Total terdata: {containers.length} Box</span>
          </div>
        </div>

        {/* Active Berths / Ships */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Kapal Sandar Aktif</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{activeVessels.length}</span>
            <span className="text-xs text-slate-400 font-medium">Kapal</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{scheduledVessels.length} kapal akan tiba</span>
          </div>
        </div>

        {/* Yard Occupancy Rate */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Yard Occupancy (YOR)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{yorPercentage}%</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${yorPercentage > 75 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {yorPercentage > 75 ? 'Tinggi' : 'Normal'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${yorPercentage > 75 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
              style={{ width: `${yorPercentage}%` }}
            />
          </div>
        </div>

        {/* Gross Crane Rate (BCH) */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Crane Rate (BCH)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{avgCraneRate}</span>
            <span className="text-xs text-slate-400 font-medium">Box/Jam</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Target min 25 box/jam</span>
          </div>
        </div>

        {/* Truck Turnaround Time */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Truck Turnaround</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{avgTrt}</span>
            <span className="text-xs text-slate-400 font-medium">Menit</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Rata-rata Dwelling: {avgDwell} hari</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Berth Operations & Yard Live Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time Berth Schedule & Crane Operations */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Status Dermaga & Operasi Kapal (Berthing Plan)</h3>
                <p className="text-xs text-slate-400">Pemantauan kapal sandar, alokasi crane, dan progres bongkar muat</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('vesselCalls')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Jadwal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Berths Simulation & Ship Mooring */}
          <div className="space-y-4">
            {berths.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Belum ada data dermaga</div>
            ) : (
              berths.map((b) => {
                const call = vesselCalls.find(
                  (vc) => vc.berthCode === b.code && (vc.status === 'Working' || vc.status === 'At Berth')
                );
                const progressDischarge = call
                  ? Math.round(((call.completedDischarge || 0) / (call.targetDischarge || 1)) * 100)
                  : 0;
                const progressLoad = call
                  ? Math.round(((call.completedLoad || 0) / (call.targetLoad || 1)) * 100)
                  : 0;

                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      b.status === 'Occupied'
                        ? 'bg-slate-950/80 border-cyan-500/30'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            b.status === 'Occupied' ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{b.code}</span>
                            <span className="text-xs text-slate-400">({b.name})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Panjang: {b.lengthMeters}m &bull; Kedalaman Draft: {b.maxDraftMeters}m &bull; Crane:{' '}
                            <span className="text-slate-300 font-mono">{b.cranes}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            b.status === 'Occupied'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {b.status === 'Occupied' ? 'KAPAL SANDAR' : 'DERMAGA KOSONG'}
                        </span>
                      </div>
                    </div>

                    {/* Ship Details if Occupied */}
                    {call ? (
                      <div className="pt-3 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Ship className="w-4 h-4 text-cyan-400" />
                            <strong className="text-slate-100 font-bold">{call.vesselName}</strong>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                              Voy: {call.voyageIn}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Crane Rate: <strong className="text-emerald-400">{call.grossCraneRate || 28.5} Box/Jam</strong>
                          </div>
                        </div>

                        {/* Progress Bars for Discharge & Load */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-400">Bongkar (Discharge)</span>
                              <span className="font-mono text-cyan-300">
                                {call.completedDischarge} / {call.targetDischarge} ({progressDischarge}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, progressDischarge)}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-400">Muat (Load)</span>
                              <span className="font-mono text-blue-300">
                                {call.completedLoad} / {call.targetLoad} ({progressLoad}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, progressLoad)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 text-xs text-slate-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dermaga siap menerima sandar kapal berikutnya</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Yard View & Live Activity Stream */}
        <div className="space-y-6">
          {/* Quick Yard Map Widget */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Ringkasan Blok Lapangan (Yard)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('yard')}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Buka Peta Detail
              </button>
            </div>

            {/* Block cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {['A', 'B', 'C', 'D'].map((blockLetter) => {
                const blockCount = containers.filter((c) => c.yardBlock === blockLetter && c.status === 'In-Yard').length;
                const blockCap = 30;
                const occ = Math.round((blockCount / blockCap) * 100);
                const blockType =
                  blockLetter === 'A'
                    ? 'Dry General'
                    : blockLetter === 'B'
                    ? 'Reefer Cold'
                    : blockLetter === 'C'
                    ? 'Empty Depot'
                    : 'Hazmat / DG';

                return (
                  <div
                    key={blockLetter}
                    onClick={() => onNavigateTab('yard')}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-extrabold text-white">Blok {blockLetter}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{blockCount}/{blockCap}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2 truncate">{blockType}</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${occ > 70 ? 'bg-amber-400' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(100, occ)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Crane Move / Tracking Ticker */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pergerakan Terkini (Live Feed)</h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {containerMoves.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">Belum ada pergerakan kontainer</div>
              ) : (
                containerMoves.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      const matched = containers.find((c) => c.containerNo === m.containerNo);
                      if (matched) onSelectContainer(matched);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-cyan-300">{m.containerNo}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-200">{m.moveType}</span>
                      <span>&bull;</span>
                      <span className="truncate">{m.fromLocation} &rarr; {m.toLocation}</span>
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
