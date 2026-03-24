import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
}

export default function StatsCard({ icon, label, value, subtitle }: StatsCardProps) {
  const Icon = icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 tracking-wide uppercase">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <img>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
