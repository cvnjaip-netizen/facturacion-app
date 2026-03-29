import { getDashboardStats, getAvailablePeriods } from '@/lib/actions';
import ClientsTable from '@/components/ClientsTable';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { periodFrom?: string; periodTo?: string };
}) {
  const { periodFrom, periodTo } = searchParams;
  const [stats, periods] = await Promise.all([
    getDashboardStats(undefined, undefined, periodFrom, periodTo),
    getAvailablePeriods(),
  ]);

  return (
    <ClientsTable
      clients={stats.clientStats}
      periods={periods}
      periodFrom={periodFrom}
      periodTo={periodTo}
    />
  );
}
