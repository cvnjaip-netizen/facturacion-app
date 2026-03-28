'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

const SECTORS = ['all', 'Contabilidad', 'General', 'Legal'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatPeriod(p: string): string {
  const [year, month] = p.split('-');
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
  const [expanded, setExpanded] = useState(false);

  const sector = searchParams.get('sector') || 'all';
  const search = searchParams.get('search') || '';
  const periodFrom = searchParams.get('from') || '';
  const periodTo = searchParams.get('to') || '';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(pathname + (qs ? '?' + qs : ''));
    },
    [router, pathname, searchParams]
  );

  const hasFilters = sector !== 'all' || search || periodFrom || periodTo;
  const activeCount = [sector !== 'all', !!search, !!periodFrom, !!periodTo].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:hidden"
      >
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter content - always visible on sm+, toggle on mobile */}
      <div className={`${expanded ? 'block' : 'hidden'} sm:block p-4 pt-0 sm:pt-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 lg:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo Desde</label>
            <select
              value={periodFrom}
              onChange={(e) => updateParams('from', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Inicio</option>
              {periods.map(p => (
                <option key={p} value={p}>{formatPeriod(p)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasta</label>
            <select
              value={periodTo}
              onChange={(e) => updateParams('to', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Fin</option>
              {periods.map(p => (
                <option key={p} value={p}>{formatPeriod(p)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sector</label>
            <select
              value={sector}
              onChange={(e) => updateParams('sector', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              {SECTORS.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => updateParams('search', e.target.value)}
              list="client-names"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-52"
            />
            <datalist id="client-names">
              {clientNames.map(n => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          {hasFilters && (
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={() => router.push(pathname)}
                className="text-sm text-blue-600 hover:text-blue-800 underline py-2"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
