'use client';

import { useEffect, useState } from 'react';
import { getPayments, deletePayment, getClients } from '@/lib/actions';
import { Payment, Client } from '@/lib/schema';
import Link from 'next/link';
import {
  CreditCard, Plus, Search, Trash2, Edit3, Download,
  DollarSign, Calendar, Clock, Upload,
} from 'lucide-react';

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(Number(n)).toLocaleString('es-VE');
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([getPayments(), getClients()]);
    setPayments(p);
    setClients(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clientMap = new Map(clients.map(c => [c.id, c.nombre]));

  const filtered = payments.filter(p => {
    if (!search) return true;
    const name = clientMap.get(p.clientId) || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
      (p.referencia || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este pago?')) return;
    await deletePayment(id);
    load();
  };

  const totalHoy = payments.reduce((s, p) => s + Number(p.monto), 0);
  const pendientes = payments.filter(p => !p.confirmado).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-16 lg:pt-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-purple-800 rounded-2xl p-6 lg:p-8 text-white shadow-xl shadow-violet-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Registro de Pagos</h1>
            <p className="text-violet-200 mt-1 text-sm">Registra cobros y aplica pagos a facturas pendientes</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/payments/new" className="flex items-center gap-2 bg-white text-violet-800 hover:bg-violet-50 rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Nuevo Pago
            </Link>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Carga Masiva</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-violet-600" /></div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Registrado</p>
              <p className="text-xl font-bold text-slate-900">{fmtBs(totalHoy)}</p>
              <p className="text-[10px] text-slate-400">{payments.length} pagos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Pendiente por Confirmar</p>
              <p className="text-xl font-bold text-amber-600">{pendientes}</p>
              <p className="text-[10px] text-slate-400">transacciones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Confirmados</p>
              <p className="text-xl font-bold text-green-700">{payments.length - pendientes}</p>
              <p className="text-[10px] text-slate-400">transacciones aplicadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Historial de Pagos
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, referencia..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando pagos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Metodo</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Referencia</th>
                  <th className="px-4 py-3 text-center font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-slate-50 table-row-hover transition-colors">
                    <td className="px-4 py-3 text-slate-600">{p.fecha}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[180px]">{clientMap.get(p.clientId) || `ID: ${p.clientId}`}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">{fmtBs(Number(p.monto))}</td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{p.formaPago}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs hidden md:table-cell">{p.referencia || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${p.confirmado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.confirmado ? 'Aplicado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/payments/${p.id}/edit`} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No se encontraron pagos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
