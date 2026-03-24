import { getDashboardStats } from '@/lib/actions';
import DataTable from '@/components/DataTable';
import { formatCurrency } from '@/lib/utils';

export default async function SectorsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sectores</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          columns={[
            { label: 'Sector', key: 'sector' },
            {
              label: 'Total Facturado',
              key: 'totalFacturado',
              render: (item) => formatCurrency(item.totalFacturado),
            },
            { label: 'Cantidad de Clientes', key: 'count' },
            {
              label: 'Promedio por Cliente',
              key: 'totalFacturado',
              render: (item) =>
                formatCurrency(item.count > 0 ? item.totalFacturado / item.count : 0),
            },
          ]}
          data={stats.sectorStats.map((sector, idx) => ({
            id: idx,
            ...sector,
          }))}
          emptyMessage="No hay datos de sectores"
        />
      </div>
    </div>
  );
}
