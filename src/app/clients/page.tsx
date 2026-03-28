import { getDashboardStats } from '@/lib/actions';
import Link from 'next/link';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export default async function ClientsPage() {
  const stats = await getDashboardStats();
  const clients = stats.clientStats;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Estadisticas por Cliente</h1>
        <p className="text-emerald-200 mt-1">
          Resumen de facturacion, cobranzas y mora por cliente | Datos calculados del historial completo 2018-2026
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-green-600 uppercase font-semibold">Prepagados</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{clients.filter(c => c.estadoCuenta === 'Prepagado').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-orange-600 uppercase font-semibold">Con Deuda</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{clients.filter(c => c.estadoCuenta === 'Deuda Pendiente').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Facturado</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{fmtBs(stats.totalFacturado)}</p>
        </div>
      </div>

      {/* Full client table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-3 py-3 text-center">Rank</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Sector</th>
                <th className="px-3 py-3 text-right">Total Facturado</th>
                <th className="px-3 py-3 text-right">Total Cobrado</th>
                <th className="px-3 py-3 text-right">Saldo Pendiente</th>
                <th className="px-3 py-3 text-center">Meses</th>
                <th className="px-3 py-3 text-right">Prom. Mensual</th>
                <th className="px-3 py-3 text-right">% Cobrado</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-3 py-3 text-center">Ranking</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.rank} className="border-t border-gray-50 hover:bg-blue-50/30">
                  <td className="px-3 py-2 text-center font-semibold text-gray-400">{c.rank}</td>
                  <td className="px-3 py-2 font-medium text-gray-900 max-w-[220px] truncate">{c.nombre}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{c.sector}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{fmtBs(c.totalFacturado)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{fmtBs(c.totalCobrado)}</td>
                  <td className={`px-3 py-2 text-right font-mono text-xs font-semibold ${c.totalPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fmtBs(c.totalPendiente)}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600 text-xs">{c.mesesActivos}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-gray-600">{fmtBs(c.promedioMensual)}</td>
                  <td className="px-3 py-2 text-right text-xs">{fmtPct(c.pctCobrado)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      c.estadoCuenta === 'Prepagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.estadoCuenta === 'Prepagado' ? 'Prepagado' : 'Deuda'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      c.rankingCobranza === 'Bueno' ? 'bg-green-100 text-green-700' :
                      c.rankingCobranza === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {c.rankingCobranza}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-400 p-2">
        Prepagado = el cliente ha pagado mas de lo facturado (saldo a su favor). Deuda Pendiente = tiene facturas sin pagar. % Cobrado {'>'} 100% = prepago.
      </div>
    </div>
  );
}
