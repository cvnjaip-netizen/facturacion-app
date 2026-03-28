import { getDashboardStats } from '@/lib/actions';
import SectorCharts from '@/components/SectorCharts';
import {
  PieChart, TrendingUp, Users, Download,
} from 'lucide-react';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function fmtCompact(n: number): string {
  if (n >= 1e9) return 'Bs. ' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return 'Bs. ' + (n / 1e6).toFixed(1) + 'M';
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

export default async function SectorsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-16 lg:pt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Estadisticas por Sectores</h1>
            <p className="text-purple-200 mt-1 text-sm">Analisis detallado del desempeno por sector y periodo</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary by Sector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Left: Summary stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Resumen General
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Periodo: 2018 – 2026</p>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Facturado</p>
              <p className="text-2xl font-bold text-slate-900">{fmtCompact(stats.totalFacturado)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Cobrado</p>
              <p className="text-2xl font-bold text-green-700">{fmtCompact(stats.totalCobrado)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-orange-600">{fmtCompact(stats.saldoPendiente)}</p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">% Cobrado Global</p>
              <p className="text-2xl font-bold text-teal-700">{fmtPct(stats.pctCobrado)}</p>
            </div>
          </div>
        </div>

        {/* Right: Sector comparison table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-purple-100">
            <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Desempeno por Sector
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Sector</th>
                  <th className="px-4 py-3 text-right font-semibold">Facturado</th>
                  <th className="px-4 py-3 text-right font-semibold hidden sm:table-cell">Cobrado</th>
                  <th className="px-4 py-3 text-right font-semibold">Pendiente</th>
                  <th className="px-4 py-3 text-center font-semibold">N°</th>
                  <th className="px-4 py-3 text-right font-semibold">% Cob.</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.sectorStats.map((s: any) => (
                  <tr key={s.sector} className="border-t border-slate-50 table-row-hover transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.sector}</td>
                    <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs">{fmtBs(s.totalFacturado)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(s.totalCobrado)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-[10px] sm:text-xs font-semibold ${s.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtBs(s.saldoPendiente)}</td>
                    <td className="px-4 py-3 text-center">{s.numClientes}</td>
                    <td className="px-4 py-3 text-right">{fmtPct(s.pctCobrado)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${
                        s.estado === 'Excelente' ? 'bg-green-100 text-green-700' :
                        s.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' :
                        s.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{s.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts */}
      <SectorCharts sectorStats={stats.sectorStats} />

      {/* Top clients per sector */}
      {stats.sectorStats.map((sector: any) => {
        const sectorClients = stats.clientStats
          .filter((c: any) => c.sector === sector.sector)
          .sort((a: any, b: any) => b.totalFacturado - a.totalFacturado)
          .slice(0, 10);

        if (sectorClients.length === 0) return null;

        return (
          <div key={sector.sector} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Top Clientes — {sector.sector}
              </h3>
              <span className={`badge ${
                sector.estado === 'Excelente' ? 'bg-green-100 text-green-700' :
                sector.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' :
                sector.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{sector.estado}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-right font-semibold">Facturado</th>
                    <th className="px-4 py-3 text-right font-semibold hidden sm:table-cell">Cobrado</th>
                    <th className="px-4 py-3 text-right font-semibold">Pendiente</th>
                    <th className="px-4 py-3 text-right font-semibold">% Cob.</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorClients.map((c: any, i: number) => (
                    <tr key={c.nombre} className="border-t border-slate-50 table-row-hover transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[200px]">{c.nombre}</td>
                      <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs">{fmtBs(c.totalFacturado)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(c.totalCobrado)}</td>
                      <td className={`px-4 py-3 text-right font-mono text-[10px] sm:text-xs font-semibold ${c.totalPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtBs(c.totalPendiente)}</td>
                      <td className="px-4 py-3 text-right">{fmtPct(c.pctCobrado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
