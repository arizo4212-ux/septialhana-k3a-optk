import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MasterDataManager } from './components/MasterDataManager';
import { VesselCallsManager } from './components/VesselCallsManager';
import { ContainersManager } from './components/ContainersManager';
import { YardMapVisualizer } from './components/YardMapVisualizer';
import { StevedoringManager } from './components/StevedoringManager';
import { GateManager } from './components/GateManager';
import { ReportsManager } from './components/ReportsManager';
import { TrackingTimelineModal } from './components/TrackingTimelineModal';
import {
  Vessel,
  Berth,
  Equipment,
  VesselCall,
  Container,
  ContainerMove,
  GateRecord,
  AlertNotification,
} from './types';
import {
  subscribeVessels,
  subscribeBerths,
  subscribeEquipment,
  subscribeVesselCalls,
  subscribeContainers,
  subscribeContainerMoves,
  subscribeGateRecords,
  subscribeNotifications,
  seedInitialPortData,
} from './services/terminalService';
import {
  BarChart3,
  Database,
  Ship,
  Layers,
  Box,
  Cpu,
  Truck,
  FileText,
  Anchor,
  Activity,
  History,
} from 'lucide-react';

const MainPortApp: React.FC = () => {
  const { user } = useAuth();

  // Real-time states
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [berths, setBerths] = useState<Berth[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [vesselCalls, setVesselCalls] = useState<VesselCall[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [containerMoves, setContainerMoves] = useState<ContainerMove[]>([]);
  const [gateRecords, setGateRecords] = useState<GateRecord[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Selected container for full tracking modal
  const [trackingContainer, setTrackingContainer] = useState<Container | null>(null);

  // Subscribe to real-time collections
  useEffect(() => {
    const unsubVessels = subscribeVessels((data) => {
      setVessels(data);
      // If collection is completely empty, auto-seed with initial data
      if (data.length === 0) {
        seedInitialPortData(user?.displayName || 'Sistem');
      }
    });
    const unsubBerths = subscribeBerths(setBerths);
    const unsubEquipment = subscribeEquipment(setEquipment);
    const unsubVesselCalls = subscribeVesselCalls(setVesselCalls);
    const unsubContainers = subscribeContainers(setContainers);
    const unsubContainerMoves = subscribeContainerMoves(setContainerMoves);
    const unsubGateRecords = subscribeGateRecords(setGateRecords);
    const unsubNotifications = subscribeNotifications(setNotifications);

    return () => {
      unsubVessels();
      unsubBerths();
      unsubEquipment();
      unsubVesselCalls();
      unsubContainers();
      unsubContainerMoves();
      unsubGateRecords();
      unsubNotifications();
    };
  }, [user]);

  // If not logged in, render the login form screen first!
  if (!user) {
    return <AuthScreen />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Analitik', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'masterData', label: 'Master Data (CRUD)', icon: <Database className="w-4 h-4" /> },
    { id: 'vesselCalls', label: 'Jadwal Kapal (Berthing)', icon: <Ship className="w-4 h-4" /> },
    { id: 'containers', label: 'Data Peti Kemas', icon: <Box className="w-4 h-4" /> },
    { id: 'yard', label: 'Peta Lapangan (Yard 2D)', icon: <Layers className="w-4 h-4" /> },
    { id: 'stevedoring', label: 'Bongkar Muat (Crane)', icon: <Cpu className="w-4 h-4" /> },
    { id: 'gate', label: 'Gerbang Truk (Gate In/Out)', icon: <Truck className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan & Ekspor', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto shadow-lg">
          <nav className="flex items-center gap-1 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Views */}
        <main className="animate-in fade-in duration-200">
          {activeTab === 'dashboard' && (
            <Dashboard
              vessels={vessels}
              berths={berths}
              equipment={equipment}
              vesselCalls={vesselCalls}
              containers={containers}
              containerMoves={containerMoves}
              gateRecords={gateRecords}
              onNavigateTab={setActiveTab}
              onSelectContainer={(c) => setTrackingContainer(c)}
            />
          )}

          {activeTab === 'masterData' && (
            <MasterDataManager
              vessels={vessels}
              berths={berths}
              equipment={equipment}
              userRole={user.role}
            />
          )}

          {activeTab === 'vesselCalls' && (
            <VesselCallsManager
              vesselCalls={vesselCalls}
              vessels={vessels}
              berths={berths}
            />
          )}

          {activeTab === 'containers' && (
            <ContainersManager
              containers={containers}
              vesselCalls={vesselCalls}
              onSelectContainerForTracking={(c) => setTrackingContainer(c)}
              operatorName={user.displayName}
            />
          )}

          {activeTab === 'yard' && (
            <YardMapVisualizer
              containers={containers}
              onSelectContainerForTracking={(c) => setTrackingContainer(c)}
            />
          )}

          {activeTab === 'stevedoring' && (
            <StevedoringManager
              vesselCalls={vesselCalls}
              containers={containers}
              containerMoves={containerMoves}
              equipment={equipment}
              operatorName={user.displayName}
              onSelectContainerForTracking={(c) => setTrackingContainer(c)}
            />
          )}

          {activeTab === 'gate' && (
            <GateManager
              gateRecords={gateRecords}
              containers={containers}
              operatorName={user.displayName}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              vesselCalls={vesselCalls}
              containers={containers}
              gateRecords={gateRecords}
              berths={berths}
            />
          )}
        </main>
      </div>

      {/* Global Tracking Timeline Modal */}
      <TrackingTimelineModal
        container={trackingContainer}
        moves={containerMoves}
        onClose={() => setTrackingContainer(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <p>PortOS &bull; Sistem Operasi Terminal Peti Kemas Online Terpadu &bull; Real-Time Cloud Firestore Sync</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainPortApp />
    </AuthProvider>
  );
}
