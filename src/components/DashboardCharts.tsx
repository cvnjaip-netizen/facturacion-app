'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706'];

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

export default function DashboardCharts({ sectorStats }: { sectorStats: SectorStat[] }) {
  const barData = sectorStats.map(s => ({
    sector: s.sector,
    Facturado: s.totalFacturado,
    Cobrado: s.totalCobrado,
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
      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Facturado vs Cobrado por Sector</h3>
        <div className="h-[280px]">
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
              <Bar dataKey="Facturado" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
              <Bar dataKey="Cobrado" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Distribucion por Sector</h3>
        <div className="h-[280px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={100}
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
              {/* Center text */}
              <text x="50%" y="43%" textAnchor="middle" className="fill-slate-400" style={{ fontSize: '11px' }}>
                Total
              </text>
              <text x="50%" y="50%" textAnchor="middle" className="fill-slate-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                Bs. {(totalFact / 1e9).toFixed(1)}B
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-2">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-slate-600">{entry.name} {entry.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
