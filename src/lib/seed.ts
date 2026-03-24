import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { clients } from './schema';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  try {
    const seedPath = join(process.cwd(), 'seed_clients.json');
    const seedData: any[] = JSON.parse(readFileSync(seedPath, 'utf-8'));

    console.log(`Seeding ${seedData.length} clients...`);

    for (const c of seedData) {
      await db.insert(clients).values({
        nombre: c.nombre,
        tipo: c.tipo || '',
        sector: c.sector,
        totalFacturado: String(c.total_facturado),
        totalCobrado: String(c.total_cobrado),
        totalPendiente: String(c.total_pendiente),
        mesesActivos: c.meses_activos,
        ultimoPago: c.ultimo_pago || null,
        promedioMensual: String(c.promedio_mensual),
        pctCobrado: String(c.pct_cobrado),
        estado: c.estado,
        rif: c.rif || null,
        observaciones: c.observaciones || null,
      }).catch(err => {
        console.warn(`Could not insert ${c.nombre}:`, err.message);
      });
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
