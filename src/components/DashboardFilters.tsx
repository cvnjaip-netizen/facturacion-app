'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

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

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo Desde</label>
        <select
          value={periodFrom}
          onChange={(e) => updateParams('from', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Inicio</option>
          {periods.map(p => (
            <option key={p} value={p}>{formatPeriod(p)}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasta</label>
        <select
          value={periodTo}
          onChange={(e) => updateParams('to', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Fin</option>
          {periods.map(p => (
            <option key={p} value={p}>{formatPeriod(p)}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sector</label>
        <select
          value={sector}
          onChange={(e) => updateParams('sector', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos</option>
          {SECTORS.filter(s => s !== 'all').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</label>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => updateParams('search', e.target.value)}
          list="client-names"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-52"
        />
        <datalist id="client-names">
          {clientNames.map(n => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-blue-600 hover:text-blue-800 underline ml-auto"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
