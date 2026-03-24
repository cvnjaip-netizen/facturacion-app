import { pgTable, serial, text, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  tipo: text('tipo'),
  sector: text('sector').notNull(), // Contabilidad, Legal, General, ISLR
  totalFacturado: numeric('total_facturado', { precision: 15, scale: 2 }).default('0'),
  totalCobrado: numeric('total_cobrado', { precision: 15, scale: 2 }).default('0'),
  totalPendiente: numeric('total_pendiente', { precision: 15, scale: 2 }).default('0'),
  mesesActivos: integer('meses_activos').default(0),
  ultimoPago: text('ultimo_pago'),
  promedioMensual: numeric('promedio_mensual', { precision: 15, scale: 2 }).default('0'),
  pctCobrado: numeric('pct_cobrado', { precision: 5, scale: 2 }).default('0'),
  estado: text('estado').notNull().default('Pendiente'), // Pendiente, Prepago
  rif: text('rif'),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  fecha: text('fecha').notNull(),
  monto: numeric('monto', { precision: 15, scale: 2 }).notNull(),
  formaPago: text('forma_pago').notNull(), // Transferencia, Efectivo, Punto de venta, Zelle, Otro
  banco: text('banco'),
  referencia: text('referencia'),
  confirmado: boolean('confirmado').default(false),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
