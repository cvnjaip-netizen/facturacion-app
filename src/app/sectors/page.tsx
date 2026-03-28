import { getDashboardStats } from '@/lib/actions';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}
function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export default async function SectorsPage() {
  const stats = await getDashboardStats();
  const sectors = stats.sectorStats;
  const clients = stats.clientStats;

  // Group clients by sector for top 10 per sector
  const sectorGroups: Record<string, typeof clients> = {};
  clients.forEach(c => {
    if (!sectorGroups[c.sector]) sectorGroups[c.sector] = [];
    sectorGroups[c.sector].push(c);
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Estadisticas por Sector</h1>
        <p className="text-purple-200 mt-1">
          Analisis comparativo: Contabilidad, Legal, ISLR, General | Comparativo de facturacion, cobranza y mora por sector (2018-2026)
        </p>
      </div>

      {/* Sector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sectors.map(s => (
          <div key={s.sector} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-900">{s.sector}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.numClientes} clientes</p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                s.estado === 'Excelente' ? 'bg-green-100 text-green-700' :
                s.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' :
                s.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {s.estado}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Facturado:</span>
                <span className="font-mono font-semibold">{fmtBs(s.totalFacturado)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cobrado:</span>
                <span className="font-mono font-semibold text-green-700">{fmtBs(s.totalCobrado)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pendiente:</span>
                <span className={`font-mono font-semibold ${s.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {fmtBs(s.saldoPendiente)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">% Cobrado:</span>
                <span className="font-semibold">{fmtPct(s.pctCobrado)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sector detail table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100">
          <h2 className="font-bold text-indigo-900">Resumen General por Sector</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-3">N</th>
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3 text-right">Total Facturado (Bs.)</th>
                <th className="px-5 py-3 text-right">Total Cobrado (Bs.)</th>
                <th className="px-5 py-3 text-right">Saldo Pendiente (Bs.)</th>
                <th className="px-5 py-3 text-center">N Clientes</th>
                <th className="px-5 py-3 text-right">% Cobrado</th>
                <th className="px-5 py-3 text-center">Estado General</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((s, i) => (
                <tr key={s.sector} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-bold text-gray-900">{s.sector}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{fmtBs(s.totalFacturado)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs">{fmtBs(s.totalCobrado)}</td>
                  <td className={`px-5 py-3 text-right font-mono text-xs ${s.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fmtBs(s.saldoPendiente)}
                  </td>
                  <td className="px-5 py-3 text-center">{s.numClientes}</td>
                  <td className="px-5 py-3 text-right">{fmtPct(s.pctCobrado)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.estado === 'Excelente' ? 'bg-green-100 text-green-700' :
                      s.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' :
                      s.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 per sector */}
      {Object.entries(sectorGroups).filter(([_, cs]) => cs.length > 0).map(([sector, cs]) => (
        <div key={sector} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Top 10 Clientes - {sector} (por Facturacion)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Facturado</th>
                  <th className="px-4 py-3 text-right">Cobrado</th>
                  <th className="px-4 py-3 text-right">Pendiente</th>
                  <th className="px-4 py-3 text-center">Meses</th>
                  <th className="px-4 py-3 text-right">% Cob.</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cs.slice(0, 10).map((c, i) => (
                  <tr key={c.nombre} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900 max-w-[250px] truncate">{c.nombre}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs">{fmtBs(c.totalFacturado)}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs">{fmtBs(c.totalCobrado)}</td>
                    <td className={`px-4 py-2 text-right font-mono text-xs ${c.totalPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmtBs(c.totalPendiente)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs">{c.mesesActivos}</td>
                    <td className="px-4 py-2 text-right text-xs">{fmtPct(c.pctCobrado)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.totalPendiente <= 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {c.totalPendiente <= 0 ? 'Prepagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
