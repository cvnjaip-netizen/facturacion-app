'use client';

import { useState, useMemo } from 'react';
import {
  Users, CheckCircle, AlertTriangle, TrendingUp, UserPlus,
  Download, Upload, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Filter, X,
} from 'lucide-react';

interface ClientRanked {
  rank: number;
  nombre: string;
  sector: string;
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  mesesActivos: number;
  ultimoPago: string;
  promedioMensual: number;
  pctCobrado: number;
  estadoCuenta: string;
  rankingCobranza: string;
}

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}
function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

type SortKey = 'nombre' | 'sector' | 'totalFacturado' | 'totalCobrado' | 'totalPendiente' | 'pctCobrado' | 'estadoCuenta';
type SortDir = 'asc' | 'desc';

export default function ClientsTable({ clients }: { clients: ClientRanked[] }) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('totalFacturado');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 15;

  const sectors = useMemo(() => {
    const s = new Set(clients.map(c => c.sector));
    return Array.from(s).sort();
  }, [clients]);

  const filtered = useMemo(() => {
    let result = [...clients];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(s) ||
        c.sector.toLowerCase().includes(s)
      );
    }
    if (sectorFilter !== 'all') {
      result = result.filter(c => c.sector === sectorFilter);
    }
    if (estadoFilter !== 'all') {
      result = result.filter(c =>
        estadoFilter === 'Prepagado'
          ? c.estadoCuenta === 'Prepagado'
          : c.estadoCuenta !== 'Prepagado'
      );
    }
    return result;
  }, [clients, search, sectorFilter, estadoFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: number | string = a[sortKey];
      let vb: number | string = b[sortKey];
      if (typeof va === 'string') {
        va = va.toLowerCase();
        vb = (vb as string).toLowerCase();
        return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'nombre' || key === 'sector' || key === 'estadoCuenta' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-1 inline text-emerald-600" />
      : <ChevronDown className="w-3 h-3 ml-1 inline text-emerald-600" />;
  };

  // KPIs
  const totalClientes = clients.length;
  const activos = clients.filter(c => c.mesesActivos > 0).length;
  const conMora = clients.filter(c => c.totalPendiente > 0).length;
  const prepagados = clients.filter(c => c.estadoCuenta === 'Prepagado').length;

  const activeFilterCount = (sectorFilter !== 'all' ? 1 : 0) + (estadoFilter !== 'all' ? 1 : 0);

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
              <Download className="w-4 h-4" /><span className="hidden sm:inline">Exportar</span>
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Upload className="w-4 h-4" /><span className="hidden sm:inline">Importar</span>
            </button>
            <button className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm">
              <UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Nuevo Cliente</span>
            </button>
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
          <p className="text-[10px] text-slate-400 mt-2">{totalClientes > 0 ? ((activos / totalClientes) * 100).toFixed(0) : 0}% del total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-red-600 uppercase tracking-wider font-semibold">Con Mora</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{conMora}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{totalClientes > 0 ? ((conMora / totalClientes) * 100).toFixed(0) : 0}% del total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-green-600 uppercase tracking-wider font-semibold">Prepagados</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{prepagados}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{totalClientes > 0 ? ((prepagados / totalClientes) * 100).toFixed(0) : 0}% del total</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar cliente o RIF..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors border ${
              showFilters || activeFilterCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Sector</label>
              <select
                value={sectorFilter}
                onChange={e => { setSectorFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              >
                <option value="all">Todos</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Estado</label>
              <select
                value={estadoFilter}
                onChange={e => { setEstadoFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              >
                <option value="all">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Prepagado">Prepagado</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setSectorFilter('all'); setEstadoFilter('all'); setPage(1); }}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium ml-auto"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {(search || activeFilterCount > 0) && (
        <p className="text-xs text-slate-500 -mt-3 ml-1">
          {sorted.length} resultado{sorted.length !== 1 ? 's' : ''} encontrado{sorted.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Client Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('nombre')}>
                  Cliente<SortIcon col="nombre" />
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('sector')}>
                  Sector<SortIcon col="sector" />
                </th>
                <th className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('totalFacturado')}>
                  Facturado<SortIcon col="totalFacturado" />
                </th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('totalCobrado')}>
                  Cobrado<SortIcon col="totalCobrado" />
                </th>
                <th className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('totalPendiente')}>
                  Pendiente<SortIcon col="totalPendiente" />
                </th>
                <th className="px-4 py-3 text-right font-semibold hidden lg:table-cell cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('pctCobrado')}>
                  % Cobrado<SortIcon col="pctCobrado" />
                </th>
                <th className="px-4 py-3 text-center font-semibold cursor-pointer hover:text-emerald-700 transition-colors select-none" onClick={() => handleSort('estadoCuenta')}>
                  Estado<SortIcon col="estadoCuenta" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, idx) => (
                <tr key={c.nombre + idx} className="border-t border-slate-50 table-row-hover transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{c.nombre}</p>
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
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">No se encontraron clientes</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">Mostrando {(page-1)*perPage+1}–{Math.min(page*perPage, sorted.length)} de {sorted.length}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                      p === page ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
