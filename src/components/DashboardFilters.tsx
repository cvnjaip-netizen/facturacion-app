'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';

const SECTORS = ['all', 'Contabilidad', 'General', 'Legal'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-');
  return `${MONTH_LABELS[month] || month} ${year}`;
}

interface Props {
  clientNames: string[];
  periods: string[];
}

export default function DashboardFilters({ clientNames, periods }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentSector = searchParams.get('sector') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentFrom = searchParams.get('from') || '';
  const currentTo = searchParams.get('to') || '';

  const activeCount = [
    currentSector !== 'all' ? 1 : 0,
    currentSearch ? 1 : 0,
    currentFrom ? 1 : 0,
    currentTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Toggle bar for mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="sm:hidden w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-700"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* Filter content */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <div className="px-5 py-4 flex flex-wrap items-end gap-4">
          {/* Period From */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 block">Periodo Desde</label>
            <select
              value={currentFrom}
              onChange={(e) => updateParams('from', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value="">Inicio</option>
              {periods.map(p => <option key={p} value={p}>{formatPeriodLabel(p)}</option>)}
            </select>
          </div>

          {/* Period To */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 block">Hasta</label>
            <select
              value={currentTo}
              onChange={(e) => updateParams('to', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value="">Fin</option>
              {periods.map(p => <option key={p} value={p}>{formatPeriodLabel(p)}</option>)}
            </select>
          </div>

          {/* Sector */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 block">Sector</label>
            <select
              value={currentSector}
              onChange={(e) => updateParams('sector', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              {SECTORS.map(s => <option key={s} value={s}>{s === 'all' ? 'Todos' : s}</option>)}
            </select>
          </div>

          {/* Client search */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5 block">Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                list="client-names"
                placeholder="Buscar cliente..."
                value={currentSearch}
                onChange={(e) => updateParams('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <datalist id="client-names">
                {clientNames.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            <button
              onClick={() => {/* Filters auto-apply */}}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
