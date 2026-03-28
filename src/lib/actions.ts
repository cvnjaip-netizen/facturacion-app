'use server';

import { db } from './db';
import { clients, payments, type NewClient, type NewPayment, type Client, type Payment } from './schema';
import { eq, like, and, type SQL } from 'drizzle-orm';
import { parseNumeric } from './utils';

// CLIENT ACTIONS

export async function getClients(
  search?: string,
  sector?: string,
  estado?: string
): Promise<Client[]> {
  const allClients = await db.select().from(clients);
  let filtered = allClients;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c => c.nombre.toLowerCase().includes(s));
  }
  if (sector && sector !== 'all') {
    filtered = filtered.filter(c => c.sector === sector);
  }
  if (estado && estado !== 'all') {
    filtered = filtered.filter(c => c.estado === estado);
  }

  return filtered.sort((a, b) => parseNumeric(b.totalFacturado) - parseNumeric(a.totalFacturado));
}

export async function getClient(id: number): Promise<Client | undefined> {
  const result = await db.select().from(clients).where(eq(clients.id, id));
  return result[0];
}

export async function createClient(data: Partial<NewClient>): Promise<Client> {
  const result = await db.insert(clients).values({
    nombre: data.nombre || '',
    tipo: data.tipo || '',
    sector: data.sector || '',
    estado: data.estado || 'Pendiente',
    totalFacturado: data.totalFacturado || '0',
    totalCobrado: data.totalCobrado || '0',
    totalPendiente: data.totalPendiente || '0',
    mesesActivos: data.mesesActivos || 0,
    promedioMensual: data.promedioMensual || '0',
    pctCobrado: data.pctCobrado || '0',
    rif: data.rif || null,
    observaciones: data.observaciones || null,
  }).returning();
  return result[0];
}

export async function updateClient(id: number, data: Partial<NewClient>): Promise<Client> {
  const result = await db
    .update(clients)
    .set({
      nombre: data.nombre, tipo: data.tipo, sector: data.sector, estado: data.estado,
      totalFacturado: data.totalFacturado, totalCobrado: data.totalCobrado,
      totalPendiente: data.totalPendiente, mesesActivos: data.mesesActivos,
      promedioMensual: data.promedioMensual, pctCobrado: data.pctCobrado,
      rif: data.rif, observaciones: data.observaciones,
    })
    .where(eq(clients.id, id))
    .returning();
  return result[0];
}

export async function deleteClient(id: number): Promise<void> {
  await db.delete(clients).where(eq(clients.id, id));
}

// PAYMENT ACTIONS

export async function getPayments(
  clientId?: number,
  search?: string
): Promise<(Payment & { clientName?: string })[]> {
  const allPayments = await db
    .select({
      id: payments.id, clientId: payments.clientId, fecha: payments.fecha,
      monto: payments.monto, formaPago: payments.formaPago, banco: payments.banco,
      referencia: payments.referencia, confirmado: payments.confirmado,
      observaciones: payments.observaciones, createdAt: payments.createdAt,
      clientName: clients.nombre,
    })
    .from(payments)
    .leftJoin(clients, eq(payments.clientId, clients.id));

  let filtered = allPayments;
  if (clientId) filtered = filtered.filter(p => p.clientId === clientId);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => p.clientName?.toLowerCase().includes(s));
  }
  return filtered;
}

export async function getPayment(id: number): Promise<Payment | undefined> {
  const result = await db.select().from(payments).where(eq(payments.id, id));
  return result[0];
}

export async function createPayment(data: Partial<NewPayment>): Promise<Payment> {
  const result = await db.insert(payments).values({
    clientId: data.clientId || 0, fecha: data.fecha || '', monto: data.monto || '0',
    formaPago: data.formaPago || '', banco: data.banco || null,
    referencia: data.referencia || null, confirmado: data.confirmado || false,
    observaciones: data.observaciones || null,
  }).returning();
  return result[0];
}

export async function updatePayment(id: number, data: Partial<NewPayment>): Promise<Payment> {
  const result = await db
    .update(payments)
    .set({
      clientId: data.clientId, fecha: data.fecha, monto: data.monto,
      formaPago: data.formaPago, banco: data.banco, referencia: data.referencia,
      confirmado: data.confirmado, observaciones: data.observaciones,
    })
    .where(eq(payments.id, id))
    .returning();
  return result[0];
}

export async function deletePayment(id: number): Promise<void> {
  await db.delete(payments).where(eq(payments.id, id));
}

// FULL DASHBOARD STATS (matching Excel exactly)

export interface SectorStat {
  sector: string;
  totalFacturado: number;
  totalCobrado: number;
  saldoPendiente: number;
  numClientes: number;
  pctCobrado: number;
  estado: string;
}

export interface ClientRanked {
  rank: number;
  nombre: string;
  sector: string;
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  mesesActivos: number;
  ultimoPago: string;
  promedioMensual: number;
  pctCobrado: number;
  estadoCuenta: string;
  rankingCobranza: string;
}

export interface DashboardStats {
  totalFacturado: number;
  totalCobrado: number;
  saldoPendiente: number;
  numClients: number;
  numConMora: number;
  pctCobrado: number;
  mayorFacturacion: { nombre: string; monto: number };
  mayorDeuda: { nombre: string; monto: number };
  periodoMeses: number;
  topClients: Array<{ rank: number; nombre: string; facturado: number; cobrado: number; pendiente: number; estado: string }>;
  topDebtors: Array<{ rank: number; nombre: string; facturado: number; cobrado: number; deuda: number; pctCobrado: number }>;
  sectorStats: SectorStat[];
  clientStats: ClientRanked[];
}

// Generate monthly periods from 2018-04 to 2026-11
function generatePeriods(): string[] {
  const periods: string[] = [];
  for (let y = 2018; y <= 2026; y++) {
    const startM = y === 2018 ? 4 : 1;
    const endM = y === 2026 ? 11 : 12;
    for (let m = startM; m <= endM; m++) {
      periods.push(`${y}-${String(m).padStart(2, '0')}`);
    }
  }
  return periods;
}

const ALL_PERIODS = generatePeriods();

// Get unique periods for the filter dropdown
export async function getAvailablePeriods(): Promise<string[]> {
  return ALL_PERIODS;
}

export async function getClientNames(): Promise<string[]> {
  const all = await db.select({ nombre: clients.nombre }).from(clients);
  return all.map(c => c.nombre).sort();
}

export async function getDashboardStats(
  sector?: string,
  search?: string,
  periodFrom?: string,
  periodTo?: string,
): Promise<DashboardStats> {
  const hasPeriodFilter = !!(periodFrom || periodTo);

  // When period filter is active, compute stats from monthly data
  if (hasPeriodFilter) {
    return getDashboardStatsFromMonthly(sector, search, periodFrom, periodTo);
  }

  // No period filter — use pre-aggregated client table (original behavior)
  let allC = await db.select().from(clients);

  if (sector && sector !== 'all') {
    allC = allC.filter(c => c.sector === sector);
  }
  if (search) {
    const s = search.toLowerCase();
    allC = allC.filter(c => c.nombre.toLowerCase().includes(s));
  }

  const totalFacturado = allC.reduce((s, c) => s + parseNumeric(c.totalFacturado), 0);
  const totalCobrado = allC.reduce((s, c) => s + parseNumeric(c.totalCobrado), 0);
  const saldoPendiente = allC.reduce((s, c) => { const p = parseNumeric(c.totalPendiente); return s + (p > 0 ? p : 0); }, 0);
  const numConMora = allC.filter(c => parseNumeric(c.totalPendiente) > 0).length;
  const pctCobrado = totalFacturado > 0 ? totalCobrado / totalFacturado : 0;

  const sortedByFact = [...allC].sort((a, b) => parseNumeric(b.totalFacturado) - parseNumeric(a.totalFacturado));
  const mayorFacturacion = sortedByFact[0] ? { nombre: sortedByFact[0].nombre, monto: parseNumeric(sortedByFact[0].totalFacturado) } : { nombre: '-', monto: 0 };
  const sortedByDeuda = [...allC].filter(c => parseNumeric(c.totalPendiente) > 0).sort((a, b) => parseNumeric(b.totalPendiente) - parseNumeric(a.totalPendiente));
  const mayorDeuda = sortedByDeuda[0] ? { nombre: sortedByDeuda[0].nombre, monto: parseNumeric(sortedByDeuda[0].totalPendiente) } : { nombre: '-', monto: 0 };

  const topClients = sortedByFact.slice(0, 10).map((c, i) => ({
    rank: i + 1, nombre: c.nombre,
    facturado: parseNumeric(c.totalFacturado), cobrado: parseNumeric(c.totalCobrado),
    pendiente: parseNumeric(c.totalPendiente),
    estado: parseNumeric(c.totalPendiente) <= 0 ? 'Prepagado' : 'Pendiente',
  }));
  const topDebtors = sortedByDeuda.slice(0, 10).map((c, i) => ({
    rank: i + 1, nombre: c.nombre,
    facturado: parseNumeric(c.totalFacturado), cobrado: parseNumeric(c.totalCobrado),
    deuda: parseNumeric(c.totalPendiente), pctCobrado: parseNumeric(c.pctCobrado),
  }));

  const sectorMap = new Map<string, { facturado: number; cobrado: number; pendiente: number; count: number }>();
  allC.forEach(c => {
    const cur = sectorMap.get(c.sector) || { facturado: 0, cobrado: 0, pendiente: 0, count: 0 };
    sectorMap.set(c.sector, { facturado: cur.facturado + parseNumeric(c.totalFacturado), cobrado: cur.cobrado + parseNumeric(c.totalCobrado), pendiente: cur.pendiente + parseNumeric(c.totalPendiente), count: cur.count + 1 });
  });
  const sectorStats: SectorStat[] = Array.from(sectorMap.entries()).map(([sec, d]) => {
    const pct = d.facturado > 0 ? d.cobrado / d.facturado : 0;
    let estado = 'Critico'; if (pct >= 1.0) estado = 'Excelente'; else if (pct >= 0.8) estado = 'Bueno'; else if (pct >= 0.5) estado = 'Regular';
    return { sector: sec, totalFacturado: d.facturado, totalCobrado: d.cobrado, saldoPendiente: d.pendiente, numClientes: d.count, pctCobrado: pct, estado };
  });

  const clientStats: ClientRanked[] = sortedByFact.map((c, i) => {
    const pct = parseNumeric(c.pctCobrado);
    let rankingCobranza = 'Critico'; if (pct >= 1.0) rankingCobranza = 'Bueno'; else if (pct >= 0.8) rankingCobranza = 'Regular';
    return { rank: i + 1, nombre: c.nombre, sector: c.sector, totalFacturado: parseNumeric(c.totalFacturado), totalCobrado: parseNumeric(c.totalCobrado), totalPendiente: parseNumeric(c.totalPendiente), mesesActivos: c.mesesActivos || 0, ultimoPago: c.ultimoPago || '-', promedioMensual: parseNumeric(c.promedioMensual), pctCobrado: pct, estadoCuenta: parseNumeric(c.totalPendiente) > 0 ? 'Deuda Pendiente' : 'Prepagado', rankingCobranza };
  });

  return { totalFacturado, totalCobrado, saldoPendiente, numClients: allC.length, numConMora, pctCobrado, mayorFacturacion, mayorDeuda, periodoMeses: 105, topClients, topDebtors, sectorStats, clientStats };
}

// Compute dashboard stats from DB client data pro-rated by period filter
async function getDashboardStatsFromMonthly(
  sector?: string,
  search?: string,
  periodFrom?: string,
  periodTo?: string,
): Promise<DashboardStats> {
  let allC = await db.select().from(clients);

  if (sector && sector !== 'all') allC = allC.filter(c => c.sector === sector);
  if (search) { const s = search.toLowerCase(); allC = allC.filter(c => c.nombre.toLowerCase().includes(s)); }

  // Calculate how many months the filter covers vs total (~105 months from 2018-04 to 2026-11)
  const totalMonths = 105;
  let filteredPeriods = ALL_PERIODS;
  if (periodFrom) filteredPeriods = filteredPeriods.filter(p => p >= periodFrom);
  if (periodTo) filteredPeriods = filteredPeriods.filter(p => p <= periodTo);
  const selectedMonths = filteredPeriods.length;
  const ratio = selectedMonths / totalMonths;

  // Pro-rate each client's totals by the period ratio
  const clientList = allC.map(c => {
    const clientMonths = c.mesesActivos || 1;
    const activeRatio = Math.min(selectedMonths, clientMonths) / Math.max(clientMonths, 1);
    const facturado = parseNumeric(c.totalFacturado) * activeRatio;
    const cobrado = parseNumeric(c.totalCobrado) * activeRatio;
    return {
      nombre: c.nombre,
      sector: c.sector,
      facturado,
      cobrado,
      pendiente: facturado - cobrado,
      months: Math.min(selectedMonths, clientMonths),
      pctCobrado: facturado > 0 ? cobrado / facturado : 0,
    };
  });

  const totalFacturado = clientList.reduce((s, c) => s + c.facturado, 0);
  const totalCobrado = clientList.reduce((s, c) => s + c.cobrado, 0);
  const saldoPendiente = clientList.reduce((s, c) => s + (c.pendiente > 0 ? c.pendiente : 0), 0);
  const numConMora = clientList.filter(c => c.pendiente > 0).length;
  const pctCobrado = totalFacturado > 0 ? totalCobrado / totalFacturado : 0;

  const sortedByFact = [...clientList].sort((a, b) => b.facturado - a.facturado);
  const mayorFacturacion = sortedByFact[0] ? { nombre: sortedByFact[0].nombre, monto: sortedByFact[0].facturado } : { nombre: '-', monto: 0 };
  const sortedByDeuda = [...clientList].filter(c => c.pendiente > 0).sort((a, b) => b.pendiente - a.pendiente);
  const mayorDeuda = sortedByDeuda[0] ? { nombre: sortedByDeuda[0].nombre, monto: sortedByDeuda[0].pendiente } : { nombre: '-', monto: 0 };

  const periodoMeses = selectedMonths;

  const topClients = sortedByFact.slice(0, 10).map((c, i) => ({
    rank: i + 1, nombre: c.nombre, facturado: c.facturado, cobrado: c.cobrado,
    pendiente: c.pendiente, estado: c.pendiente <= 0 ? 'Prepagado' : 'Pendiente',
  }));
  const topDebtors = sortedByDeuda.slice(0, 10).map((c, i) => ({
    rank: i + 1, nombre: c.nombre, facturado: c.facturado, cobrado: c.cobrado,
    deuda: c.pendiente, pctCobrado: c.pctCobrado,
  }));

  // Sector stats
  const sectorMap = new Map<string, { facturado: number; cobrado: number; pendiente: number; count: number }>();
  clientList.forEach(c => {
    const cur = sectorMap.get(c.sector) || { facturado: 0, cobrado: 0, pendiente: 0, count: 0 };
    sectorMap.set(c.sector, { facturado: cur.facturado + c.facturado, cobrado: cur.cobrado + c.cobrado, pendiente: cur.pendiente + c.pendiente, count: cur.count + 1 });
  });
  const sectorStats: SectorStat[] = Array.from(sectorMap.entries()).map(([sec, d]) => {
    const pct = d.facturado > 0 ? d.cobrado / d.facturado : 0;
    let estado = 'Critico'; if (pct >= 1.0) estado = 'Excelente'; else if (pct >= 0.8) estado = 'Bueno'; else if (pct >= 0.5) estado = 'Regular';
    return { sector: sec, totalFacturado: d.facturado, totalCobrado: d.cobrado, saldoPendiente: d.pendiente, numClientes: d.count, pctCobrado: pct, estado };
  });

  const clientStats: ClientRanked[] = sortedByFact.map((c, i) => {
    let rankingCobranza = 'Critico'; if (c.pctCobrado >= 1.0) rankingCobranza = 'Bueno'; else if (c.pctCobrado >= 0.8) rankingCobranza = 'Regular';
    return { rank: i + 1, nombre: c.nombre, sector: c.sector, totalFacturado: c.facturado, totalCobrado: c.cobrado, totalPendiente: c.pendiente, mesesActivos: c.months, ultimoPago: '-', promedioMensual: c.months > 0 ? c.facturado / c.months : 0, pctCobrado: c.pctCobrado, estadoCuenta: c.pendiente > 0 ? 'Deuda Pendiente' : 'Prepagado', rankingCobranza };
  });

  return { totalFacturado, totalCobrado, saldoPendiente, numClients: clientList.length, numConMora, pctCobrado, mayorFacturacion, mayorDeuda, periodoMeses, topClients, topDebtors, sectorStats, clientStats };
}
