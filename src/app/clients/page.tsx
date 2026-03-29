import { getDashboardStats } from '@/lib/actions';
import ClientsTable from '@/components/ClientsTable';

export default async function ClientsPage() {
  const stats = await getDashboardStats();
  return <ClientsTable clients={stats.clientStats} />;
}
