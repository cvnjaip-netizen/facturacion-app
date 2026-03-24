import { getDashboardStats } from '@/lib/actions';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import {
  SectorPieChart,
  TopClientsBarChart,
  StatusPieChart,
  DebtBarChart,
} from '@/components/Charts';
import { DollarSign, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statusData = [
    { estado: 'Pendiente', value: stats.numPendiente },
    { estado: 'Prepago', value: stats.numClients - stats.numPendiente },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          icon={<DollarSign size={24} />}
          label="Total Facturado"
          value={formatCurrency(stats.totalFacturado)}
        />
        <StatsCard
          icon={<CheckCircle size={24} />}
          label="Total Cobrado"
          value={formatCurrency(stats.totalCobrado)}
        />
        <StatsCard
          icon={<AlertCircle size={24} />}
          label="Saldo Pendiente"
          value={formatCurrency(stats.totalPendiente)}
        />
        <StatsCard
          icon={<Users size={24} />}
          label="Clientes"
          value={stats.numClients}
        />
        <StatsCard
          icon={<TrendingUp size={24} />}
          label="% Cobrado"
          value={`${stats.pctCobrado.toFixed(1)}%`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SectorPieChart data={stats.sectorStats} />
        <StatusPieChart data={statusData} />
        <TopClientsBarChart data={stats.topClients} />
        <DebtBarChart data={stats.topDebtors} />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Clientes</h2>
          <DataTable
            columns={[
              { label: 'Cliente', key: 'nombre' },
              {
                label: 'Facturado',
                key: 'totalFacturado',
                render: (item) => formatCurrency(item.totalFacturado),
              },
            ]}
            data={stats.topClients.map((item, idx) => ({
              id: idx,
              ...item,
            }))}
          />
        </div>

        {/* Top Debtors Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Deudores</h2>
          <DataTable
            columns={[
              { label: 'Cliente', key: 'nombre' },
              {
                label: 'Pendiente',
                key: 'totalPendiente',
                render: (item) => formatCurrency(item.totalPendiente),
              },
            ]}
            data={stats.topDebtors.map((item, idx) => ({
              id: idx,
              ...item,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
