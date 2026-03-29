import { getDashboardStats } from '@/lib/actions';
import {
  Users, CheckCircle, AlertTriangle, TrendingUp, UserPlus,
  Download, Upload, Search,
} from 'lucide-react';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const stats = await getDashboardStats();
  const allClients = stats.clientStats;

  const searchTerm = searchParams?.search?.toLowerCase() || '';
  const filtered = searchTerm
    ? allClients.filter((c: any) => c.nombre.toLowerCase().includes(searchTerm) || c.sector.toLowerCase().includes(searchTerm))
    : allClients;

  const page = Math.max(1, parseInt(searchParams?.page || '1'));
  const perPage = 15;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalClientes = allClients.length;
  const activos = allClients.filter((c: any) => c.mesesActivos > 0).length;
  const conMora = allClients.filter((c: any) => c.totalPendiente > 0).length;
  const prepagados = allClients.filter((c: any) => c.estadoCuenta === 'Prepagado').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-16 lg:pt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestion de Clientes</h1>
            <p className="text-emerald-200 mt-1 text-sm">Consulta y administra la cartera de clientes</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <a href="/clients/new" className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </a>
          </div>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Clientes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalClientes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Users className="w-5 h-5 text-slate-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-600 uppercase tracking-wider font-semibold">Activos</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{activos}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{((activos / totalClientes) * 100).toFixed(0)}% del total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-red-600 uppercase tracking-wider font-semibold">Con Mora</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{conMora}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{((conMora / totalClientes) * 100).toFixed(0)}% del total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-green-600 uppercase tracking-wider font-semibold">Prepagados</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{prepagados}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{((prepagados / totalClientes) * 100).toFixed(0)}% del total</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4">
        <form className="flex items-center gap-4" action="/clients" method="GET">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              placeholder="Buscar cliente o RIF..."
              defaultValue={searchTerm}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
            Buscar
          </button>
        </form>
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 text-right font-semibold">Facturado</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Cobrado</th>
                <th className="px-4 py-3 text-right font-semibold">Pendiente</th>
                <th className="px-4 py-3 text-right font-semibold hidden lg:table-cell">% Cobrado</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c: any) => (
                <tr key={c.rank} className="border-t border-slate-50 table-row-hover transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-400">{c.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{c.nombre}</p>
                    <p className="text-[10px] text-slate-400 hidden sm:block">RIF: {c.rif || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-slate-100 text-slate-600">{c.sector}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs">{fmtBs(c.totalFacturado)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] sm:text-xs hidden md:table-cell">{fmtBs(c.totalCobrado)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-[10px] sm:text-xs font-semibold ${c.totalPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {fmtBs(c.totalPendiente)}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">{fmtPct(c.pctCobrado)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${
                      c.estadoCuenta === 'Prepagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {c.estadoCuenta === 'Prepagado' ? 'Prepagado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Mostrando {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/clients?page=${p}${searchTerm ? `&search=${searchTerm}` : ''}`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    p === page ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </a>
              ))}
              {totalPages > 7 && <span className="text-slate-400 px-1">...</span>}
              {totalPages > 7 && (
                <a href={`/clients?page=${totalPages}${searchTerm ? `&search=${searchTerm}` : ''}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-100">{totalPages}</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
