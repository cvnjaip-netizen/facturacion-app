import { getDashboardStats, getClientNames, getAvailablePeriods } from '@/lib/actions';
import DashboardFilters from '@/components/DashboardFilters';
import { Suspense } from 'react';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { sector?: string; search?: string; from?: string; to?: string };
}) {
  const sector = searchParams?.sector || undefined;
  const search = searchParams?.search || undefined;
  const periodFrom = searchParams?.from || undefined;
  const periodTo = searchParams?.to || undefined;
  const [stats, clientNames] = await Promise.all([
    getDashboardStats(sector, search, periodFrom, periodTo),
    getClientNames(),
  ]);
  const periods = await getAvailablePeriods();

  const isFiltered = !!(sector || search || periodFrom || periodTo);

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          Dashboard Ejecutivo
        </h1>
        <p className="text-blue-200 mt-1 text-xs sm:text-sm">
          Resumen ejecutivo de facturacion y cobranzas | Periodo 2018 - 2026 | Todos los importes en Bolivares (Bs.)
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <DashboardFilters clientNames={clientNames} periods={periods} />
      </Suspense>

      {isFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-700">
          Filtros activos: {periodFrom || periodTo ? `Periodo: ${periodFrom || 'inicio'} a ${periodTo || 'fin'}` : ''}{(periodFrom || periodTo) && (sector || search) ? ' | ' : ''}{sector && sector !== 'all' ? `Sector: ${sector}` : ''}{sector && search ? ' | ' : ''}{search ? `Cliente: "${search}"` : ''} — {stats.numClients} cliente{stats.numClients !== 1 ? 's' : ''}, {stats.periodoMeses} meses
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Facturado</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">{fmtBs(stats.totalFacturado)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Facturacion historica 2018-2026</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-green-600 uppercase tracking-wide font-semibold">Total Cobrado</p>
          <p className="text-base sm:text-xl font-bold text-green-700 mt-1 sm:mt-2 truncate">{fmtBs(stats.totalCobrado)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Pagos recibidos (incluye anticipos)</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-orange-600 uppercase tracking-wide font-semibold">Saldo Pendiente</p>
          <p className="text-base sm:text-xl font-bold text-orange-600 mt-1 sm:mt-2 truncate">{fmtBs(stats.saldoPendiente)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Clientes con deuda sin cobrar</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-blue-600 uppercase tracking-wide font-semibold">Clientes Activos</p>
          <p className="text-base sm:text-xl font-bold text-blue-700 mt-1 sm:mt-2">{stats.numClients} clientes</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Con historial de facturacion</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold">Ultimo Pago</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">Marzo 2026</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Pago mas reciente registrado</p>
        </div>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold">% Cobrado Global</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{fmtPct(stats.pctCobrado)}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Cobrado / Facturado historico</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-red-600 uppercase tracking-wide font-semibold">Clientes con Mora</p>
          <p className="text-base sm:text-xl font-bold text-red-600 mt-1 sm:mt-2">{stats.numConMora} clientes</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Con saldo pendiente positivo</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-yellow-600 uppercase tracking-wide font-semibold">Mayor Facturacion</p>
          <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1 sm:mt-2 truncate">{stats.mayorFacturacion.nombre}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{fmtBs(stats.mayorFacturacion.monto)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-red-600 uppercase tracking-wide font-semibold">Mayor Deuda</p>
          <p className="text-sm sm:text-lg font-bold text-red-700 mt-1 sm:mt-2 truncate">{stats.mayorDeuda.nombre}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{fmtBs(stats.mayorDeuda.monto)} pendiente</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-semibold">Periodo Analizado</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.periodoMeses} meses</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 hidden sm:block">Abril 2018 - Diciembre 2026</p>
        </div>
      </div>

      {/* Top 10 Tables side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top 10 by Facturacion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-4 sm:px-5 py-3 border-b border-blue-100">
            <h2 className="font-bold text-blue-900 text-sm sm:text-base">Top 10 Clientes por Facturacion</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[10px] sm:text-xs text-gray-500 uppercase">
                  <th className="px-3 sm:px-4 py-2 sm:py-3">#</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3">Cliente</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Facturado</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right hidden sm:table-cell">Cobrado</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Pendiente</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.topClients.map((c) => (
                  <tr key={c.rank} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2 font-semibold text-gray-400">{c.rank}</td>
                    <td className="px-3 sm:px-4 py-2 font-medium text-gray-900 max-w-[120px] sm:max-w-[200px] truncate">{c.nombre}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-gray-700 font-mono text-[10px] sm:text-xs">{fmtBs(c.facturado)}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-gray-700 font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(c.cobrado)}</td>
                    <td className={`px-3 sm:px-4 py-2 text-right font-mono text-[10px] sm:text-xs ${c.pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmtBs(c.pendiente)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-center hidden sm:table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.estado === 'Prepagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {c.estado === 'Prepagado' ? 'Prepagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Debtors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 px-4 sm:px-5 py-3 border-b border-red-100">
            <h2 className="font-bold text-red-900 text-sm sm:text-base">Top 10 Clientes con Mayor Deuda</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[10px] sm:text-xs text-gray-500 uppercase">
                  <th className="px-3 sm:px-4 py-2 sm:py-3">#</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3">Cliente</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right hidden sm:table-cell">Facturado</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right hidden sm:table-cell">Cobrado</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Deuda</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">% Cob.</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDebtors.map((c) => (
                  <tr key={c.rank} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2 font-semibold text-gray-400">{c.rank}</td>
                    <td className="px-3 sm:px-4 py-2 font-medium text-gray-900 max-w-[120px] sm:max-w-[200px] truncate">{c.nombre}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-gray-700 font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(c.facturado)}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-gray-700 font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(c.cobrado)}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-red-600 font-bold font-mono text-[10px] sm:text-xs">{fmtBs(c.deuda)}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-gray-500 text-xs">{fmtPct(c.pctCobrado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sector Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-50 px-4 sm:px-5 py-3 border-b border-indigo-100">
          <h2 className="font-bold text-indigo-900 text-sm sm:text-base">Resumen por Sector</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[10px] sm:text-xs text-gray-500 uppercase">
                <th className="px-3 sm:px-5 py-2 sm:py-3">Sector</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-right">Facturado</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-right hidden sm:table-cell">Cobrado</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-right">Pendiente</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-center hidden sm:table-cell">N Clientes</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-right">% Cob.</th>
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.sectorStats.map((s) => (
                <tr key={s.sector} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-3 sm:px-5 py-2 sm:py-3 font-semibold text-gray-900">{s.sector}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-right font-mono text-[10px] sm:text-xs">{fmtBs(s.totalFacturado)}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-right font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(s.totalCobrado)}</td>
                  <td className={`px-3 sm:px-5 py-2 sm:py-3 text-right font-mono text-[10px] sm:text-xs ${s.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fmtBs(s.saldoPendiente)}
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-center hidden sm:table-cell">{s.numClientes}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-right">{fmtPct(s.pctCobrado)}</td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                      s.estado === 'Excelente' ? 'bg-green-100 text-green-700' :
                      s.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' :
                      s.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.estado === 'Excelente' ? 'Excelente' :
                       s.estado === 'Bueno' ? 'Bueno' :
                       s.estado === 'Regular' ? 'Regular' : 'Critico'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] sm:text-xs text-gray-400 pb-4">
        Sistema de Facturacion y Cobranzas | Datos historicos: Abril 2018 - Diciembre 2026 | Todos los importes en Bolivares (Bs.)
      </div>
    </div>
  );
}
