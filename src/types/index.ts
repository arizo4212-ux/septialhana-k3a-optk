export type Role = 'Admin' | 'Planner' | 'Operator' | 'GateOfficer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  imoNumber: string;
  flag: string;
  capacityTeu: number;
  loaMeters: number;
  shippingLine: string;
  status: 'Active' | 'In Maintenance' | 'Retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface Berth {
  id: string;
  code: string;
  name: string;
  lengthMeters: number;
  maxDraftMeters: number;
  cranes: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentVesselName?: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: 'STS Crane' | 'RTG Crane' | 'Reach Stacker' | 'Head Truck';
  status: 'Operational' | 'Standby' | 'Maintenance' | 'Breakdown';
  operatorName: string;
  totalMoves: number;
}

export interface VesselCall {
  id: string;
  vesselId: string;
  vesselName: string;
  voyageIn: string;
  voyageOut: string;
  berthCode: string;
  eta: string;
  etd: string;
  ata?: string;
  atd?: string;
  status: 'Scheduled' | 'Anchorage' | 'At Berth' | 'Working' | 'Completed' | 'Departed';
  targetDischarge: number;
  completedDischarge: number;
  targetLoad: number;
  completedLoad: number;
  assignedCranes: string;
  grossCraneRate?: number;
}

export interface Container {
  id: string;
  containerNo: string;
  size: '20ft' | '40ft' | '45ft';
  type: 'Dry' | 'Reefer' | 'Hazmat/DG' | 'Tank' | 'Open Top' | 'Flat Rack';
  status: 'Inbound-Vessel' | 'In-Yard' | 'Outbound-Vessel' | 'Gated-Out' | 'Under-Inspection';
  yardBlock: string; // e.g. "A", "B", "C", "D"
  yardBay: string;   // e.g. "01", "03", "05"
  yardRow: string;   // e.g. "01", "02", "04"
  yardTier: string;  // e.g. "1", "2", "3", "4"
  grossWeightKg: number;
  sealNo: string;
  shippingLine: string;
  vesselCallId?: string;
  vesselName?: string;
  temperatureCelsius?: number;
  dwellDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContainerMove {
  id: string;
  containerNo: string;
  moveType: 'Discharge' | 'Load' | 'Yard-Shifting' | 'Gate-In' | 'Gate-Out' | 'Inspection';
  fromLocation: string;
  toLocation: string;
  equipmentCode: string;
  operatorName: string;
  timestamp: string;
  notes: string;
}

export interface GateRecord {
  id: string;
  ticketNo: string;
  containerNo: string;
  truckPlate: string;
  driverName: string;
  direction: 'Gate-In' | 'Gate-Out';
  deliveryOrderNo: string;
  sealStatus: 'Intact' | 'Broken' | 'Missing' | 'Replaced';
  physicalCondition: 'Good' | 'Minor Damage' | 'Severe Damage';
  gatePassStatus: 'Approved' | 'Pending Inspection' | 'Rejected';
  turnaroundMinutes: number;
  timestamp: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  category: 'Vessel' | 'Crane' | 'Gate' | 'Yard' | 'Alert';
  severity: 'info' | 'success' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}
