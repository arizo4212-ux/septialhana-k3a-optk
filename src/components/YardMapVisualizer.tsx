import React, { useState } from 'react';
import { Container } from '../types';
import {
  Layers,
  Box,
  Thermometer,
  AlertTriangle,
  Info,
  CheckCircle2,
  Move,
  History,
  Eye,
  Filter,
} from 'lucide-react';

interface YardMapVisualizerProps {
  containers: Container[];
  onSelectContainerForTracking: (c: Container) => void;
}

export const YardMapVisualizer: React.FC<YardMapVisualizerProps> = ({
  containers,
  onSelectContainerForTracking,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  // Generate grid structure for active block (e.g. 6 bays x 4 rows)
  const bays = ['01', '02', '03', '04', '05', '06'];
  const rows = ['01', '02', '03', '04'];

  const blockContainers = containers.filter(
    (c) => c.yardBlock === selectedBlock && c.status === 'In-Yard'
  );

  const blockCapacity = bays.length * rows.length; // 24 slots shown per block view
  const occupancyRate = Math.min(100, Math.round((blockContainers.length / blockCapacity) * 100));

  const getSlotContainer = (bay: string, row: string): Container | undefined => {
    return blockContainers.find((c) => c.yardBay === bay && c.yardRow === row);
  };

  const getContainerColor = (type?: string) => {
    switch (type) {
      case 'Reefer':
        return 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30';
      case 'Hazmat/DG':
        return 'bg-rose-500/20 border-rose-400 text-rose-300 hover:bg-rose-500/30';
      case 'Tank':
        return 'bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-purple-500/30';
      default:
        return 'bg-blue-600/20 border-blue-400 text-blue-300 hover:bg-blue-600/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Block Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Interactive Yard Grid 2D
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Visualisasi Lapangan Penumpukan (Yard Map)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Peta penataan peti kemas interaktif berdasarkan Blok, Bay, Row, dan Tier dengan pemantauan suhu reefer
          </p>
        </div>

        {/* Block Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {[
            { id: 'A' as const, name: 'Blok A', type: 'Dry General' },
            { id: 'B' as const, name: 'Blok B', type: 'Reefer Stacking' },
            { id: 'C' as const, name: 'Blok C', type: 'Empty Depot' },
            { id: 'D' as const, name: 'Blok D', type: 'Hazmat / DG' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBlock(b.id); setSelectedContainer(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center ${
                selectedBlock === b.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{b.name}</span>
              <span className={`text-[9px] ${selectedBlock === b.id ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                {b.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Yard Metrics & Legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Utilisasi Blok {selectedBlock}</span>
            <span className="text-2xl font-black text-white">{occupancyRate}%</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-cyan-400 font-bold">{blockContainers.length} Box</span>
            <span className="text-[10px] text-slate-500 block">Kapasitas 24 Slot</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Legenda Tipe Kontainer:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-500/30 border border-blue-400 inline-block" />
              <span className="text-slate-300">Dry (General)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-cyan-500/30 border border-cyan-400 inline-block" />
              <span className="text-slate-300">Reefer (Pendingin)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500/30 border border-rose-400 inline-block" />
              <span className="text-slate-300">Hazmat / DG</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-500/30 border border-purple-400 inline-block" />
              <span className="text-slate-300">Tank</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800 inline-block" />
              <span className="text-slate-500">Slot Kosong</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Visualizer */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 overflow-x-auto">
        <div className="min-w-[650px]">
          <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
            <span className="font-mono">KORIDOR DERMAGA &bull; QUAYSIDE &rarr;</span>
            <span className="font-bold text-white uppercase tracking-wider">
              LAYOUT BLOK {selectedBlock} (BAYS &times; ROWS)
            </span>
            <span className="font-mono">&larr; GERBANG UTAMA &bull; GATESIDE</span>
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-3">
                <div className="w-16 shrink-0 text-right font-mono text-xs text-slate-500 font-bold">
                  Row {row}
                </div>

                <div className="grid grid-cols-6 gap-3 flex-1">
                  {bays.map((bay) => {
                    const cntr = getSlotContainer(bay, row);
                    const isSelected = selectedContainer?.id === cntr?.id && cntr !== undefined;

                    return (
                      <div
                        key={`${bay}-${row}`}
                        onClick={() => {
                          if (cntr) setSelectedContainer(cntr);
                        }}
                        className={`min-h-[85px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                          cntr
                            ? `${getContainerColor(cntr.type)} ${
                                isSelected ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
                              }`
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-slate-400">
                            B{bay}-R{row}
                          </span>
                          {cntr && (
                            <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-200">
                              T{cntr.yardTier}
                            </span>
                          )}
                        </div>

                        {cntr ? (
                          <div className="my-1">
                            <div className="font-mono font-bold text-xs truncate text-white">
                              {cntr.containerNo}
                            </div>
                            <div className="text-[10px] text-slate-300 truncate">{cntr.shippingLine}</div>
                            {cntr.type === 'Reefer' && cntr.temperatureCelsius !== undefined && (
                              <div className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                                <Thermometer className="w-3 h-3" />
                                <span>{cntr.temperatureCelsius}°C</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="my-auto text-center text-[10px] text-slate-600 font-mono">
                            [Slot Kosong]
                          </div>
                        )}

                        <div className="text-[9px] text-right text-slate-400 font-mono">
                          {cntr ? `${cntr.size}` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bay column labels at bottom */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800 mt-4">
            <div className="w-16 shrink-0" />
            <div className="grid grid-cols-6 gap-3 flex-1 text-center font-mono text-xs text-slate-500 font-bold">
              {bays.map((bay) => (
                <div key={bay}>Bay {bay}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Container Detail Drawer */}
      {selectedContainer && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-mono">{selectedContainer.containerNo}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedContainer.size} {selectedContainer.type}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                <span>
                  Posisi Slot:{' '}
                  <strong className="text-cyan-400 font-mono">
                    Blok {selectedContainer.yardBlock} ({selectedContainer.yardBay}-{selectedContainer.yardRow}-T{selectedContainer.yardTier})
                  </strong>
                </span>
                <span>&bull;</span>
                <span>Shipping: <strong className="text-slate-200">{selectedContainer.shippingLine}</strong></span>
                <span>&bull;</span>
                <span>Berat: <strong className="text-slate-200">{(selectedContainer.grossWeightKg || 0).toLocaleString()} kg</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectContainerForTracking(selectedContainer)}
              className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Lihat Histori Pelacakan</span>
            </button>
            <button
              onClick={() => setSelectedContainer(null)}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
