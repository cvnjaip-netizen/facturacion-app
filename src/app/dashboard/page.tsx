import { getDashboardStats, getClientNames, getAvailablePeriods } from '@/lib/actions';
import DashboardFilters from '@/components/DashboardFilters';
import DashboardCharts from '@/components/DashboardCharts';
import { Suspense } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Percent,
  AlertTriangle,
  Trophy,
  AlertCircle,
  Calendar,
  Download,
  PieChart,
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
  const pctValue = Math.round(stats.pctCobrado * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-16 lg:pt-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
            <p className="text-blue-200 mt-1 text-sm">Resumen ejecutivo filtrado por periodo, sector y cliente</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm border border-white/10">
              <Calendar className="w-4 h-4" />
              <span>Abr 2018 – Dic 2026</span>
            </div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <DashboardFilters clientNames={clientNames} periods={periods} />
      </Suspense>

      {isFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          Filtros activos: {periodFrom || periodTo ? `Periodo: ${periodFrom || 'inicio'} a ${periodTo || 'fin'}` : ''}{(periodFrom || periodTo) && (sector || search) ? ' | ' : ''}{sector && sector !== 'all' ? `Sector: ${sector}` : ''}{sector && search ? ' | ' : ''}{search ? `Cliente: "${search}"` : ''} — {stats.numClients} cliente{stats.numClients !== 1 ? 's' : ''}, {stats.periodoMeses} meses
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-blue card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Facturado</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 truncate">{fmtCompact(stats.totalFacturado)}</p>
          <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block">Facturacion historica 2018–2026</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-green card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Cobrado</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-700 truncate">{fmtCompact(stats.totalCobrado)}</p>
          <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block">Pagos recibidos (incluye anticipos)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-orange card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Clock className="w-4 h-4 text-orange-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Saldo Pendiente</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-orange-600 truncate">{fmtCompact(stats.saldoPendiente)}</p>
          <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block">Clientes con deuda sin cobrar</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-indigo card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Clientes Activos</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-indigo-700">{stats.numClients} clientes</p>
          <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block">Con historial de facturacion</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-teal card-hover col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center"><Percent className="w-4 h-4 text-teal-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">% Cobrado Global</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg sm:text-xl font-bold text-teal-700">{fmtPct(stats.pctCobrado)}</p>
            <div className="relative w-10 h-10 flex-shrink-0 hidden sm:block">
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0d9488" strokeWidth="3" strokeDasharray={`${Math.min(pctValue, 100)}, 100`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block">Cobrado / Facturado historico</p>
        </div>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-red card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Clientes con Mora</p>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.numConMora} clientes</p>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{stats.numConMora} de {stats.numClients}</span>
              <span>{Math.round(stats.numConMora / stats.numClients * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full progress-animated" style={{ width: `${Math.round(stats.numConMora / stats.numClients * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-amber card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Trophy className="w-4 h-4 text-amber-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Mayor Facturacion</p>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">{stats.mayorFacturacion.nombre}</p>
          <p className="text-sm text-amber-600 font-semibold mt-1">{fmtCompact(stats.mayorFacturacion.monto)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 accent-left accent-red card-hover">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-600" /></div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Mayor Deuda</p>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">{stats.mayorDeuda.nombre}</p>
          <p className="text-sm text-red-600 font-semibold mt-1">{fmtCompact(stats.mayorDeuda.monto)} pendiente</p>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts sectorStats={stats.sectorStats} />

      {/* Top 10 Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-100">
            <h2 className="font-bold text-blue-900 text-sm sm:text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" />Top 10 Clientes por Facturacion</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead><tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">#</th><th className="px-4 py-3 font-semibold">Cliente</th><th className="px-4 py-3 text-right font-semibold">Facturado</th><th className="px-4 py-3 text-right font-semibold hidden sm:table-cell">Cobrado</th><th className="px-4 py-3 text-right font-semibold">Pendiente</th><th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">Estado</th>
              </tr></thead>
              <tbody>
                {stats.topClients.map((c: any) => (
                  <tr key={c.rank} className="border-t border-slate-50 table-row-hover transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-400">{c.rank}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[140px] sm:max-w-[200px] truncate">{c.nombre}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono text-[10px] sm:text-xs">{fmtBs(c.facturado)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(c.cobrado)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-[10px] sm:text-xs font-semibold ${c.pendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtBs(c.pendiente)}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell"><span className={`badge ${c.estado === 'Prepagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.estado === 'Prepagado' ? 'Prepagado' : 'Pendiente'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 border-b border-red-100">
            <h2 className="font-bold text-red-900 text-sm sm:text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Top 10 Clientes con Mayor Deuda</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead><tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">#</th><th className="px-4 py-3 font-semibold">Cliente</th><th className="px-4 py-3 text-right font-semibold">Deuda</th><th className="px-4 py-3 text-right font-semibold">% Cob.</th><th className="px-4 py-3 font-semibold hidden sm:table-cell">Progreso</th>
              </tr></thead>
              <tbody>
                {stats.topDebtors.map((c: any) => (
                  <tr key={c.rank} className="border-t border-slate-50 table-row-hover transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-400">{c.rank}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[140px] sm:max-w-[200px] truncate">{c.nombre}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-bold font-mono text-[10px] sm:text-xs">{fmtBs(c.deuda)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">{fmtPct(c.pctCobrado)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full progress-animated ${c.pctCobrado >= 0.9 ? 'bg-green-500' : c.pctCobrado >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.round(c.pctCobrado * 100), 100)}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sector Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 border-b border-indigo-100">
          <h2 className="font-bold text-indigo-900 text-sm sm:text-base flex items-center gap-2"><PieChart className="w-4 h-4" />Resumen por Sector</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead><tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-semibold">Sector</th><th className="px-5 py-3 text-right font-semibold">Facturado</th><th className="px-5 py-3 text-right font-semibold hidden sm:table-cell">Cobrado</th><th className="px-5 py-3 text-right font-semibold">Pendiente</th><th className="px-5 py-3 text-center font-semibold hidden sm:table-cell">N Clientes</th><th className="px-5 py-3 text-right font-semibold">% Cob.</th><th className="px-5 py-3 font-semibold hidden sm:table-cell">Progreso</th><th className="px-5 py-3 text-center font-semibold">Estado</th>
            </tr></thead>
            <tbody>
              {stats.sectorStats.map((s: any) => (
                <tr key={s.sector} className="border-t border-slate-50 table-row-hover transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{s.sector}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[10px] sm:text-xs">{fmtBs(s.totalFacturado)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[10px] sm:text-xs hidden sm:table-cell">{fmtBs(s.totalCobrado)}</td>
                  <td className={`px-5 py-3.5 text-right font-mono text-[10px] sm:text-xs ${s.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtBs(s.saldoPendiente)}</td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">{s.numClientes}</td>
                  <td className="px-5 py-3.5 text-right">{fmtPct(s.pctCobrado)}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full progress-animated ${s.pctCobrado >= 1 ? 'bg-green-500' : s.pctCobrado >= 0.8 ? 'bg-blue-500' : s.pctCobrado >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.round(s.pctCobrado * 100), 100)}%` }} /></div></td>
                  <td className="px-5 py-3.5 text-center"><span className={`badge ${s.estado === 'Excelente' ? 'bg-green-100 text-green-700' : s.estado === 'Bueno' ? 'bg-blue-100 text-blue-700' : s.estado === 'Regular' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] sm:text-xs text-slate-400 pb-6">
        Sistema de Facturacion y Cobranzas | Datos historicos: Abril 2018 - Diciembre 2026 | Todos los importes en Bolivares (Bs.)
      </div>
    </div>
  );
}
