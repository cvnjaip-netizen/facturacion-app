'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface SectorData {
  sector: string;
  totalFacturado: number;
}

interface TopClientsData {
  nombre: string;
  totalFacturado: number;
}

interface StatusData {
  estado: string;
  value: number;
}

interface DebtData {
  nombre: string;
  totalPendiente: number;
}

export function SectorPieChart({ data }: { data: SectorData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Facturación por Sector</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ sector, value }) => `${sector}: ${value.toLocaleString()}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="totalFacturado"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `Bs. ${Number(value).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopClientsBarChart({ data }: { data: TopClientsData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Clientes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" width={190} />
          <Tooltip
            formatter={(value) => `Bs. ${Number(value).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`}
          />
          <Bar dataKey="totalFacturado" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data }: { data: StatusData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Clientes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ estado, value }) => `${estado}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DebtBarChart({ data }: { data: DebtData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Deudores</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" width={190} />
          <Tooltip
            formatter={(value) => `Bs. ${Number(value).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`}
          />
          <Bar dataKey="totalPendiente" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
