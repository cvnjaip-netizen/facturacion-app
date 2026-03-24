'use server';

import { db } from './db';
import { clients, payments, type NewClient, type NewPayment, type Client, type Payment } from './schema';
import { eq, like, and, isNull, not, type SQL } from 'drizzle-orm';
import { parseNumeric } from './utils';

// CLIENT ACTIONS

export async function getClients(
  search?: string,
  sector?: string,
  estado?: string
): Promise<Client[]> {
  let query = db.select().from(clients);

  const filters: SQL[] = [];

  if (search) {
    filters.push(like(clients.nombre, `%${search}%`));
  }

  if (sector && sector !== 'all') {
    filters.push(eq(clients.sector, sector));
  }

  if (estado && estado !== 'all') {
    filters.push(eq(clients.estado, estado));
  }

  if (filters.length > 0) {
    query = query.where(and(...filters));
  }

  return query;
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
      nombre: data.nombre,
      tipo: data.tipo,
      sector: data.sector,
      estado: data.estado,
      totalFacturado: data.totalFacturado,
      totalCobrado: data.totalCobrado,
      totalPendiente: data.totalPendiente,
      mesesActivos: data.mesesActivos,
      promedioMensual: data.promedioMensual,
      pctCobrado: data.pctCobrado,
      rif: data.rif,
      observaciones: data.observaciones,
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
  let query = db
    .select({
      id: payments.id,
      clientId: payments.clientId,
      fecha: payments.fecha,
      monto: payments.monto,
      formaPago: payments.formaPago,
      banco: payments.banco,
      referencia: payments.referencia,
      confirmado: payments.confirmado,
      observaciones: payments.observaciones,
      createdAt: payments.createdAt,
      clientName: clients.nombre,
    })
    .from(payments)
    .leftJoin(clients, eq(payments.clientId, clients.id));

  const filters: any[] = [];

  if (clientId) {
    filters.push(eq(payments.clientId, clientId));
  }

  if (search) {
    filters.push(like(clients.nombre, `%${search}%`));
  }

  if (filters.length > 0) {
    query = query.where(and(...filters));
  }

  return query.orderBy(payments.createdAt);
}

export async function getPayment(id: number): Promise<Payment | undefined> {
  const result = await db.select().from(payments).where(eq(payments.id, id));
  return result[0];
}

export async function createPayment(data: Partial<NewPayment>): Promise<Payment> {
  const result = await db.insert(payments).values({
    clientId: data.clientId || 0,
    fecha: data.fecha || '',
    monto: data.monto || '0',
    formaPago: data.formaPago || '',
    banco: data.banco || null,
    referencia: data.referencia || null,
    confirmado: data.confirmado || false,
    observaciones: data.observaciones || null,
  }).returning();

  return result[0];
}

export async function updatePayment(id: number, data: Partial<NewPayment>): Promise<Payment> {
  const result = await db
    .update(payments)
    .set({
      clientId: data.clientId,
      fecha: data.fecha,
      monto: data.monto,
      formaPago: data.formaPago,
      banco: data.banco,
      referencia: data.referencia,
      confirmado: data.confirmado,
      observaciones: data.observaciones,
    })
    .where(eq(payments.id, id))
    .returning();

  return result[0];
}

export async function deletePayment(id: number): Promise<void> {
  await db.delete(payments).where(eq(payments.id, id));
}

// DASHBOARD STATS

export interface DashboardStats {
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  numClients: number;
  numPendiente: number;
  pctCobrado: number;
  topClients: Array<{ nombre: string; totalFacturado: number }>;
  topDebtors: Array<{ nombre: string; totalPendiente: number }>;
  sectorStats: Array<{ sector: string; totalFacturado: number; count: number }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const allClients = await db.select().from(clients);

  const totalFacturado = allClients.reduce(
    (sum, c) => sum + parseNumeric(c.totalFacturado),
    0
  );

  const totalCobrado = allClients.reduce(
    (sum, c) => sum + parseNumeric(c.totalCobrado),
    0
  );

  const totalPendiente = allClients.reduce(
    (sum, c) => sum + parseNumeric(c.totalPendiente),
    0
  );

  const numPendiente = allClients.filter((c) => c.estado === 'Pendiente').length;
  const pctCobrado =
    totalFacturado > 0 ? (totalCobrado / totalFacturado) * 100 : 0;

  const topClients = allClients
    .sort((a, b) => parseNumeric(b.totalFacturado) - parseNumeric(a.totalFacturado))
    .slice(0, 10)
    .map((c) => ({
      nombre: c.nombre,
      totalFacturado: parseNumeric(c.totalFacturado),
    }));

  const topDebtors = allClients
    .sort((a, b) => parseNumeric(b.totalPendiente) - parseNumeric(a.totalPendiente))
    .slice(0, 10)
    .map((c) => ({
      nombre: c.nombre,
      totalPendiente: parseNumeric(c.totalPendiente),
    }));

  const sectorMap = new Map<string, { total: number; count: number }>();
  allClients.forEach((c) => {
    const current = sectorMap.get(c.sector) || { total: 0, count: 0 };
    sectorMap.set(c.sector, {
      total: current.total + parseNumeric(c.totalFacturado),
      count: current.count + 1,
    });
  });

  const sectorStats = Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    totalFacturado: data.total,
    count: data.count,
  }));

  return {
    totalFacturado,
    totalCobrado,
    totalPendiente,
    numClients: allClients.length,
    numPendiente,
    pctCobrado,
    topClients,
    topDebtors,
    sectorStats,
  };
}
