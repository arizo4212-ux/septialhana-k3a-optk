import React, { useState } from 'react';
import { VesselCall, Container, GateRecord, Berth } from '../types';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Ship,
  Layers,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface ReportsManagerProps {
  vesselCalls: VesselCall[];
  containers: Container[];
  gateRecords: GateRecord[];
  berths: Berth[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  vesselCalls,
  containers,
  gateRecords,
  berths,
}) => {
  const [reportType, setReportType] = useState<'vessel' | 'yard' | 'truck' | 'manifest'>('vessel');
  const [shippingLineFilter, setShippingLineFilter] = useState('ALL');

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'vessel') {
      csvContent += 'Vessel Name,Voyage In,Voyage Out,Berth,Status,ETA,ETD,Discharge Box,Load Box,Crane Rate BCH\n';
      vesselCalls.forEach((vc) => {
        csvContent += `"${vc.vesselName}","${vc.voyageIn}","${vc.voyageOut}","${vc.berthCode}","${vc.status}","${vc.eta}","${vc.etd}",${vc.completedDischarge},${vc.completedLoad},${vc.grossCraneRate || 28.5}\n`;
      });
    } else if (reportType === 'manifest') {
      csvContent += 'Container No,Size,Type,Status,Block,Bay,Row,Tier,Gross Weight KG,Shipping Line,Seal No\n';
      containers.forEach((c) => {
        csvContent += `"${c.containerNo}","${c.size}","${c.type}","${c.status}","${c.yardBlock}","${c.yardBay}","${c.yardRow}","${c.yardTier}",${c.grossWeightKg},"${c.shippingLine}","${c.sealNo}"\n`;
      });
    } else if (reportType === 'truck') {
      csvContent += 'Ticket No,Direction,Container No,Truck Plate,Driver,Delivery Order,Seal Status,Turnaround Min,Timestamp\n';
      gateRecords.forEach((g) => {
        csvContent += `"${g.ticketNo}","${g.direction}","${g.containerNo}","${g.truckPlate}","${g.driverName}","${g.deliveryOrderNo}","${g.sealStatus}",${g.turnaroundMinutes},"${g.timestamp}"\n`;
      });
    } else {
      csvContent += 'Block,Designated Type,Capacity Box,Occupied Box,YOR %\n';
      ['A', 'B', 'C', 'D'].forEach((blk) => {
        const count = containers.filter((c) => c.yardBlock === blk && c.status === 'In-Yard').length;
        csvContent += `Block ${blk},General,30,${count},${Math.round((count / 30) * 100)}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Terminal_Peti_Kemas_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Laporan Operasional & Analitik Kinerja</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan throughput dermaga, utilisasi lapangan penumpukan (YOR), dwelling time, dan rekapitulasi arus gerbang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setReportType('vessel')}
          className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer ${
            reportType === 'vessel'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ship className="w-4 h-4 shrink-0" />
          <span className="text-xs">Kinerja Kapal & Berth</span>
        </button>

        <button
          onClick={() => setReportType('yard')}
          className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer ${
            reportType === 'yard'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span className="text-xs">Yard Occupancy (YOR)</span>
        </button>

        <button
          onClick={() => setReportType('truck')}
          className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer ${
            reportType === 'truck'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span className="text-xs">Turnaround Truk (TRT)</span>
        </button>

        <button
          onClick={() => setReportType('manifest')}
          className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer ${
            reportType === 'manifest'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="text-xs">Manifest Peti Kemas</span>
        </button>
      </div>

      {/* REPORT CONTENT: VESSEL CALLS */}
      {reportType === 'vessel' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Laporan Produktivitas Dermaga & Kapal (Berth Throughput & BCH)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Periode: Real-Time Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Kapal</th>
                  <th className="py-3 px-4">Voyage</th>
                  <th className="py-3 px-4">Dermaga</th>
                  <th className="py-3 px-4">Bongkar (Discharge)</th>
                  <th className="py-3 px-4">Muat (Load)</th>
                  <th className="py-3 px-4">Total Gerakan Box</th>
                  <th className="py-3 px-4">Gross Crane Rate (BCH)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {vesselCalls.map((c) => {
                  const total = (c.completedDischarge || 0) + (c.completedLoad || 0);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{c.vesselName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.voyageIn}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">{c.berthCode}</td>
                      <td className="py-3 px-4 font-mono">{c.completedDischarge} / {c.targetDischarge}</td>
                      <td className="py-3 px-4 font-mono">{c.completedLoad} / {c.targetLoad}</td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{total} Box</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{c.grossCraneRate || 28.5} Box/Jam</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: YARD OCCUPANCY */}
      {reportType === 'yard' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Laporan Utilisasi Lapangan Penumpukan (Yard Occupancy Rate - YOR)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['A', 'B', 'C', 'D'].map((b) => {
              const count = containers.filter((c) => c.yardBlock === b && c.status === 'In-Yard').length;
              const cap = 30;
              const pct = Math.round((count / cap) * 100);

              return (
                <div key={b} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">Blok {b}</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{pct}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">Terisi: {count} dari {cap} Box</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPORT CONTENT: TRUCK TRT */}
      {reportType === 'truck' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Laporan Waktu Layanan & Kelancaran Gerbang (Truck Turnaround Time)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Tiket</th>
                  <th className="py-3 px-4">Arah</th>
                  <th className="py-3 px-4">Plat Truk</th>
                  <th className="py-3 px-4">Supir</th>
                  <th className="py-3 px-4">Kontainer</th>
                  <th className="py-3 px-4">Kondisi Segel</th>
                  <th className="py-3 px-4">Turnaround Time</th>
                  <th className="py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {gateRecords.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-cyan-300 font-bold">{g.ticketNo}</td>
                    <td className="py-3 px-4 font-bold">{g.direction}</td>
                    <td className="py-3 px-4 font-mono">{g.truckPlate}</td>
                    <td className="py-3 px-4">{g.driverName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{g.containerNo}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{g.sealStatus}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{g.turnaroundMinutes} Menit</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(g.timestamp).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: MANIFEST */}
      {reportType === 'manifest' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Laporan Manifest Peti Kemas (Container Inventory Manifest)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Kontainer</th>
                  <th className="py-3 px-4">Ukuran & Tipe</th>
                  <th className="py-3 px-4">Slot Lapangan</th>
                  <th className="py-3 px-4">Shipping Line</th>
                  <th className="py-3 px-4">Segel</th>
                  <th className="py-3 px-4">Berat Kotor</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {containers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">{c.containerNo}</td>
                    <td className="py-3 px-4">{c.size} {c.type}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      {c.yardBlock}-{c.yardBay}-{c.yardRow}-{c.yardTier}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{c.shippingLine}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.sealNo || '-'}</td>
                    <td className="py-3 px-4 font-mono">{(c.grossWeightKg || 0).toLocaleString()} kg</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
