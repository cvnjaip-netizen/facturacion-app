'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#7c3aed', '#2563eb', '#d97706', '#16a34a', '#ef4444'];

function fmtCompact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return Math.round(n).toLocaleString('es-VE');
}

function fmtBs(n: number): string {
  return 'Bs. ' + Math.round(n).toLocaleString('es-VE');
}

interface SectorStat {
  sector: string;
  totalFacturado: number;
  totalCobrado: number;
  saldoPendiente: number;
  numClientes: number;
  pctCobrado: number;
  estado: string;
}

export default function SectorCharts({ sectorStats }: { sectorStats: SectorStat[] }) {
  const barData = sectorStats.map(s => ({
    sector: s.sector,
    Facturado: s.totalFacturado,
    Cobrado: s.totalCobrado,
    Pendiente: s.saldoPendiente,
  }));

  const totalFact = sectorStats.reduce((sum, s) => sum + s.totalFacturado, 0);
  const pieData = sectorStats.map((s, i) => ({
    name: s.sector,
    value: s.totalFacturado,
    pct: ((s.totalFacturado / totalFact) * 100).toFixed(1),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Facturado vs Cobrado vs Pendiente */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Facturado vs Cobrado por Sector</h3>
        <p className="text-[10px] text-slate-400 mb-4">Comparacion de montos facturados, cobrados y pendientes</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" tickFormatter={fmtCompact} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                formatter={(value: number) => fmtBs(value)}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Facturado" fill="#7c3aed" radius={[0, 6, 6, 0]} barSize={16} />
              <Bar dataKey="Cobrado" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={16} />
              <Bar dataKey="Pendiente" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart - Participacion por Sector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Participacion por Sector</h3>
        <p className="text-[10px] text-slate-400 mb-4">Distribucion del total facturado por sector</p>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => fmtBs(value)}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
              />
              <text x="50%" y="43%" textAnchor="middle" className="fill-slate-400" style={{ fontSize: '11px' }}>
                Total Facturado
              </text>
              <text x="50%" y="51%" textAnchor="middle" className="fill-slate-900" style={{ fontSize: '18px', fontWeight: 700 }}>
                Bs. {(totalFact / 1e9).toFixed(1)}B
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-slate-600 font-medium">{entry.name}</span>
              <span className="text-xs text-slate-400">{entry.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
