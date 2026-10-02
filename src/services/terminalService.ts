import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Vessel,
  Berth,
  Equipment,
  VesselCall,
  Container,
  ContainerMove,
  GateRecord,
  AlertNotification,
} from '../types';

// Real-time subscriptions
export function subscribeVessels(callback: (vessels: Vessel[]) => void): () => void {
  const path = 'vessels';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Vessel[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Vessel, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeBerths(callback: (berths: Berth[]) => void): () => void {
  const path = 'berths';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Berth[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Berth, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeEquipment(callback: (equipment: Equipment[]) => void): () => void {
  const path = 'equipment';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Equipment[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Equipment, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeVesselCalls(callback: (calls: VesselCall[]) => void): () => void {
  const path = 'vesselCalls';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: VesselCall[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<VesselCall, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeContainers(callback: (containers: Container[]) => void): () => void {
  const path = 'containers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Container[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<Container, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeContainerMoves(callback: (moves: ContainerMove[]) => void): () => void {
  const path = 'containerMoves';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(150));
  return onSnapshot(
    q,
    (snapshot) => {
      const data: ContainerMove[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<ContainerMove, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeGateRecords(callback: (records: GateRecord[]) => void): () => void {
  const path = 'gateRecords';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const data: GateRecord[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<GateRecord, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export function subscribeNotifications(callback: (notifications: AlertNotification[]) => void): () => void {
  const path = 'notifications';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const data: AlertNotification[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...(docSnap.data() as Omit<AlertNotification, 'id'>) });
      });
      callback(data);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

// CRUD: Vessels
export async function saveVessel(vessel: Omit<Vessel, 'id'> & { id?: string }): Promise<string> {
  const path = 'vessels';
  const id = vessel.id || `vessel_${vessel.imoNumber || Date.now()}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, {
      ...vessel,
      id,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteVessel(id: string): Promise<void> {
  const path = 'vessels';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// CRUD: Berths
export async function saveBerth(berth: Omit<Berth, 'id'> & { id?: string }): Promise<string> {
  const path = 'berths';
  const id = berth.id || `berth_${(berth.code || 'B01').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { ...berth, id }, { merge: true });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBerth(id: string): Promise<void> {
  const path = 'berths';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// CRUD: Equipment
export async function saveEquipment(eq: Omit<Equipment, 'id'> & { id?: string }): Promise<string> {
  const path = 'equipment';
  const id = eq.id || `eq_${(eq.code || 'EQ01').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { ...eq, id }, { merge: true });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  const path = 'equipment';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// CRUD: VesselCalls
export async function saveVesselCall(call: Omit<VesselCall, 'id'> & { id?: string }): Promise<string> {
  const path = 'vesselCalls';
  const id = call.id || `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { ...call, id }, { merge: true });
    
    // Also add auto-notification safely
    try {
      await addNotification({
        title: `Jadwal Kapal Diperbarui`,
        message: `${call.vesselName} (${call.voyageIn}) di ${call.berthCode} status: ${call.status}`,
        category: 'Vessel',
        severity: call.status === 'At Berth' || call.status === 'Working' ? 'info' : 'success',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (notifErr) {
      console.warn('Auto notification skipped:', notifErr);
    }

    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteVesselCall(id: string): Promise<void> {
  const path = 'vesselCalls';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// CRUD: Containers
export async function saveContainer(cntr: Omit<Container, 'id'> & { id?: string }, operatorName = 'Operator Terminal'): Promise<string> {
  const path = 'containers';
  const cleanId = (cntr.containerNo || `cntr_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, path, cleanId);
    await setDoc(docRef, {
      ...cntr,
      id: cleanId,
      updatedAt: now,
      createdAt: cntr.createdAt || now,
    }, { merge: true });

    // Record automatic move in history tracking safely
    try {
      await recordContainerMove({
        containerNo: cntr.containerNo,
        moveType: cntr.status === 'Inbound-Vessel' ? 'Discharge' : cntr.status === 'Gated-Out' ? 'Gate-Out' : 'Yard-Shifting',
        fromLocation: 'System / Input',
        toLocation: `${cntr.yardBlock}-${cntr.yardBay}-${cntr.yardRow}-${cntr.yardTier}`,
        equipmentCode: 'TOS-Dispatch',
        operatorName,
        timestamp: now,
        notes: `Update status: ${cntr.status} (${cntr.type} ${cntr.size})`,
      });
    } catch (moveErr) {
      console.warn('Container move logging note:', moveErr);
    }

    return cleanId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteContainer(id: string): Promise<void> {
  const path = 'containers';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Record Move
export async function recordContainerMove(move: Omit<ContainerMove, 'id'>): Promise<string> {
  const path = 'containerMoves';
  const id = `move_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { ...move, id });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Gate Records
export async function saveGateRecord(record: Omit<GateRecord, 'id'> & { id?: string }): Promise<string> {
  const path = 'gateRecords';
  const id = record.id || `gate_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, { ...record, id }, { merge: true });

    // Notification for gate activity safely
    try {
      await addNotification({
        title: `${record.direction}: ${record.truckPlate}`,
        message: `Kontainer ${record.containerNo} oleh ${record.driverName} - Status Fisik: ${record.physicalCondition}`,
        category: 'Gate',
        severity: record.physicalCondition === 'Severe Damage' ? 'critical' : record.physicalCondition === 'Minor Damage' ? 'warning' : 'success',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (notifErr) {
      console.warn('Gate notification skipped:', notifErr);
    }

    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Notifications
export async function addNotification(notif: Omit<AlertNotification, 'id'>): Promise<string> {
  const path = 'notifications';
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, notif);
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const path = 'notifications';
  try {
    await updateDoc(doc(db, path, id), { read: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function markAllNotificationsRead(ids: string[]): Promise<void> {
  const path = 'notifications';
  try {
    const promises = ids.map((id) => updateDoc(doc(db, path, id), { read: true }));
    await Promise.all(promises);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// SEED INITIAL DEMO DATA
export async function seedInitialPortData(operatorName = 'Sistem Otomatis'): Promise<void> {
  console.log('Seeding initial container terminal data...');

  // 1. Master Vessels
  const vessels: Omit<Vessel, 'id'>[] = [
    {
      name: 'MV SAMUDERA INDONESIA 01',
      callSign: 'YDYP',
      imoNumber: '9421832',
      flag: 'Indonesia (ID)',
      capacityTeu: 4500,
      loaMeters: 260,
      shippingLine: 'Samudera Indonesia',
      status: 'Active',
    },
    {
      name: 'EVER GIVEN V-902',
      callSign: 'H3RC',
      imoNumber: '9811000',
      flag: 'Panama (PA)',
      capacityTeu: 20124,
      loaMeters: 400,
      shippingLine: 'Evergreen Marine',
      status: 'Active',
    },
    {
      name: 'MAERSK MC-KINNEY MOLLER',
      callSign: 'OUW2',
      imoNumber: '9619907',
      flag: 'Denmark (DK)',
      capacityTeu: 18270,
      loaMeters: 399,
      shippingLine: 'Maersk Line',
      status: 'Active',
    },
    {
      name: 'KM MERATUS JAVA',
      callSign: 'PKZX',
      imoNumber: '9352109',
      flag: 'Indonesia (ID)',
      capacityTeu: 1600,
      loaMeters: 175,
      shippingLine: 'Meratus Line',
      status: 'Active',
    },
    {
      name: 'ONE APUS EXPRESS',
      callSign: '7KLL',
      imoNumber: '9826079',
      flag: 'Japan (JP)',
      capacityTeu: 14052,
      loaMeters: 364,
      shippingLine: 'Ocean Network Express',
      status: 'Active',
    },
  ];

  for (const v of vessels) {
    const cleanId = `vessel_${v.imoNumber}`;
    await setDoc(doc(db, 'vessels', cleanId), v, { merge: true });
  }

  // 2. Master Berths
  const berths: Berth[] = [
    {
      id: 'berth_01',
      code: 'BERTH-01',
      name: 'Dermaga Peti Kemas Utara 01',
      lengthMeters: 350,
      maxDraftMeters: 14.5,
      cranes: 'STS-01, STS-02',
      status: 'Occupied',
      currentVesselName: 'MV SAMUDERA INDONESIA 01',
    },
    {
      id: 'berth_02',
      code: 'BERTH-02',
      name: 'Dermaga Peti Kemas Utara 02',
      lengthMeters: 420,
      maxDraftMeters: 16.0,
      cranes: 'STS-03, STS-04',
      status: 'Occupied',
      currentVesselName: 'EVER GIVEN V-902',
    },
    {
      id: 'berth_03',
      code: 'BERTH-03',
      name: 'Dermaga Peti Kemas Selatan 03',
      lengthMeters: 300,
      maxDraftMeters: 13.0,
      cranes: 'STS-05',
      status: 'Available',
    },
    {
      id: 'berth_04',
      code: 'BERTH-04',
      name: 'Dermaga Domestik 04',
      lengthMeters: 280,
      maxDraftMeters: 11.5,
      cranes: 'STS-06, Harbor Crane HC-01',
      status: 'Available',
    },
  ];

  for (const b of berths) {
    await setDoc(doc(db, 'berths', b.id), b, { merge: true });
  }

  // 3. Master Equipment
  const equipments: Equipment[] = [
    { id: 'eq_sts01', code: 'STS-01', name: 'Super Post-Panamax Quay Crane 01', type: 'STS Crane', status: 'Operational', operatorName: 'Budi Santoso', totalMoves: 412 },
    { id: 'eq_sts02', code: 'STS-02', name: 'Super Post-Panamax Quay Crane 02', type: 'STS Crane', status: 'Operational', operatorName: 'Hendra Wijaya', totalMoves: 389 },
    { id: 'eq_sts03', code: 'STS-03', name: 'Megamax Quay Crane 03', type: 'STS Crane', status: 'Operational', operatorName: 'Agus Pratama', totalMoves: 512 },
    { id: 'eq_rtg01', code: 'RTG-01', name: 'Electric RTG Crane Block A', type: 'RTG Crane', status: 'Operational', operatorName: 'Rudi Hartono', totalMoves: 620 },
    { id: 'eq_rtg02', code: 'RTG-02', name: 'Electric RTG Crane Block B', type: 'RTG Crane', status: 'Operational', operatorName: 'Dedi Kusuma', totalMoves: 590 },
    { id: 'eq_rs01', code: 'RS-01', name: 'Kalmar Reach Stacker Heavy', type: 'Reach Stacker', status: 'Standby', operatorName: 'Fajar Nugraha', totalMoves: 215 },
    { id: 'eq_ht01', code: 'HT-01', name: 'Terberg Terminal Tractor Head 01', type: 'Head Truck', status: 'Operational', operatorName: 'Iwan Falsi', totalMoves: 830 },
  ];

  for (const eq of equipments) {
    await setDoc(doc(db, 'equipment', eq.id), eq, { merge: true });
  }

  // 4. Vessel Calls
  const now = new Date();
  const vesselCalls: VesselCall[] = [
    {
      id: 'call_smd_01',
      vesselId: 'vessel_9421832',
      vesselName: 'MV SAMUDERA INDONESIA 01',
      voyageIn: 'V.2601I',
      voyageOut: 'V.2602O',
      berthCode: 'BERTH-01',
      eta: new Date(now.getTime() - 14 * 3600000).toISOString().slice(0, 16),
      etd: new Date(now.getTime() + 18 * 3600000).toISOString().slice(0, 16),
      ata: new Date(now.getTime() - 12 * 3600000).toISOString().slice(0, 16),
      status: 'Working',
      targetDischarge: 850,
      completedDischarge: 520,
      targetLoad: 600,
      completedLoad: 180,
      assignedCranes: 'STS-01, STS-02',
      grossCraneRate: 28.5,
    },
    {
      id: 'call_eg_02',
      vesselId: 'vessel_9811000',
      vesselName: 'EVER GIVEN V-902',
      voyageIn: 'EG-881N',
      voyageOut: 'EG-882S',
      berthCode: 'BERTH-02',
      eta: new Date(now.getTime() - 20 * 3600000).toISOString().slice(0, 16),
      etd: new Date(now.getTime() + 24 * 3600000).toISOString().slice(0, 16),
      ata: new Date(now.getTime() - 18 * 3600000).toISOString().slice(0, 16),
      status: 'Working',
      targetDischarge: 1400,
      completedDischarge: 980,
      targetLoad: 1100,
      completedLoad: 410,
      assignedCranes: 'STS-03, STS-04',
      grossCraneRate: 31.2,
    },
    {
      id: 'call_mrt_03',
      vesselId: 'vessel_9352109',
      vesselName: 'KM MERATUS JAVA',
      voyageIn: 'MRT-109',
      voyageOut: 'MRT-110',
      berthCode: 'BERTH-04',
      eta: new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 16),
      etd: new Date(now.getTime() + 32 * 3600000).toISOString().slice(0, 16),
      status: 'Scheduled',
      targetDischarge: 320,
      completedDischarge: 0,
      targetLoad: 290,
      completedLoad: 0,
      assignedCranes: 'STS-06',
      grossCraneRate: 0,
    },
  ];

  for (const vc of vesselCalls) {
    await setDoc(doc(db, 'vesselCalls', vc.id), vc, { merge: true });
  }

  // 5. Containers in Yard and Moves
  const initialContainers: Container[] = [
    {
      id: 'SMCU2049182',
      containerNo: 'SMCU2049182',
      size: '40ft',
      type: 'Dry',
      status: 'In-Yard',
      yardBlock: 'A',
      yardBay: '03',
      yardRow: '02',
      yardTier: '2',
      grossWeightKg: 28450,
      sealNo: 'SM-994102',
      shippingLine: 'Samudera Indonesia',
      vesselCallId: 'call_smd_01',
      vesselName: 'MV SAMUDERA INDONESIA 01',
      dwellDays: 2.4,
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MSKU8841023',
      containerNo: 'MSKU8841023',
      size: '40ft',
      type: 'Reefer',
      status: 'In-Yard',
      yardBlock: 'B',
      yardBay: '05',
      yardRow: '01',
      yardTier: '1',
      grossWeightKg: 24100,
      sealNo: 'ML-881239',
      shippingLine: 'Maersk Line',
      temperatureCelsius: -18.5,
      dwellDays: 1.1,
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EGLV5910281',
      containerNo: 'EGLV5910281',
      size: '20ft',
      type: 'Hazmat/DG',
      status: 'In-Yard',
      yardBlock: 'D',
      yardBay: '01',
      yardRow: '03',
      yardTier: '1',
      grossWeightKg: 19800,
      sealNo: 'EG-441209',
      shippingLine: 'Evergreen Marine',
      vesselCallId: 'call_eg_02',
      vesselName: 'EVER GIVEN V-902',
      dwellDays: 4.8,
      createdAt: new Date(now.getTime() - 110 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ONEY3019827',
      containerNo: 'ONEY3019827',
      size: '40ft',
      type: 'Dry',
      status: 'In-Yard',
      yardBlock: 'A',
      yardBay: '03',
      yardRow: '04',
      yardTier: '3',
      grossWeightKg: 29120,
      sealNo: 'ONE-887123',
      shippingLine: 'Ocean Network Express',
      dwellDays: 3.2,
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MRTU1049281',
      containerNo: 'MRTU1049281',
      size: '20ft',
      type: 'Dry',
      status: 'In-Yard',
      yardBlock: 'C',
      yardBay: '02',
      yardRow: '01',
      yardTier: '2',
      grossWeightKg: 14200,
      sealNo: 'MR-192831',
      shippingLine: 'Meratus Line',
      dwellDays: 1.8,
      createdAt: new Date(now.getTime() - 36 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TGHU9918234',
      containerNo: 'TGHU9918234',
      size: '20ft',
      type: 'Tank',
      status: 'In-Yard',
      yardBlock: 'D',
      yardBay: '02',
      yardRow: '02',
      yardTier: '1',
      grossWeightKg: 26000,
      sealNo: 'TK-992100',
      shippingLine: 'Samudera Indonesia',
      dwellDays: 0.9,
      createdAt: new Date(now.getTime() - 18 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const c of initialContainers) {
    await setDoc(doc(db, 'containers', c.id), c, { merge: true });
    
    // Add tracking move
    const moveId = `move_${c.containerNo}_01`;
    await setDoc(doc(db, 'containerMoves', moveId), {
      id: moveId,
      containerNo: c.containerNo,
      moveType: 'Discharge',
      fromLocation: c.vesselName || 'Vessel Hold',
      toLocation: `Yard ${c.yardBlock}-${c.yardBay}-${c.yardRow}-${c.yardTier}`,
      equipmentCode: 'STS-01',
      operatorName: 'Budi Santoso',
      timestamp: c.createdAt,
      notes: 'Bongkar aman dari palka kapal, kondisi segel baik',
    }, { merge: true });
  }

  // 6. Gate Records
  const initialGates: GateRecord[] = [
    {
      id: 'gate_001',
      ticketNo: 'GTK-20261001-081',
      containerNo: 'SMCU2049182',
      truckPlate: 'B 9842 TPA',
      driverName: 'Wahyu Widodo',
      direction: 'Gate-In',
      deliveryOrderNo: 'DO-SMD-88219',
      sealStatus: 'Intact',
      physicalCondition: 'Good',
      gatePassStatus: 'Approved',
      turnaroundMinutes: 14,
      timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
    },
    {
      id: 'gate_002',
      ticketNo: 'GTK-20261001-082',
      containerNo: 'MSKU8841023',
      truckPlate: 'B 9112 UEK',
      driverName: 'Rahmat Hidayat',
      direction: 'Gate-In',
      deliveryOrderNo: 'DO-MSK-44910',
      sealStatus: 'Intact',
      physicalCondition: 'Good',
      gatePassStatus: 'Approved',
      turnaroundMinutes: 18,
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      id: 'gate_003',
      ticketNo: 'GTK-20261001-083',
      containerNo: 'EGLV5910281',
      truckPlate: 'B 9481 ZXA',
      driverName: 'Yanto Sugiarto',
      direction: 'Gate-Out',
      deliveryOrderNo: 'DO-EGL-12904',
      sealStatus: 'Intact',
      physicalCondition: 'Minor Damage',
      gatePassStatus: 'Approved',
      turnaroundMinutes: 22,
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
    },
  ];

  for (const g of initialGates) {
    await setDoc(doc(db, 'gateRecords', g.id), g, { merge: true });
  }

  // 7. Initial Notifications
  const initialNotifs: AlertNotification[] = [
    {
      id: 'notif_01',
      title: 'Kapal Sandar di Dermaga 01',
      message: 'MV SAMUDERA INDONESIA 01 telah tambat aman di BERTH-01. Operasi STS-01 dan STS-02 dimulai.',
      category: 'Vessel',
      severity: 'info',
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'notif_02',
      title: 'Peringatan Reefer Monitoring',
      message: 'Kontainer MSKU8841023 di Blok B-05 suhu stabil -18.5°C (Power On).',
      category: 'Yard',
      severity: 'success',
      timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif_03',
      title: 'Target Crane Rate Tercapai',
      message: 'STS-03 mencatat kecepatan 31.2 box/jam pada kapal EVER GIVEN.',
      category: 'Crane',
      severity: 'success',
      timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
      read: false,
    },
  ];

  for (const n of initialNotifs) {
    await setDoc(doc(db, 'notifications', n.id), n, { merge: true });
  }

  console.log('Seed completed successfully!');
}
