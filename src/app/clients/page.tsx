'use client';

import { useEffect, useState } from 'react';
import { getClients, deleteClient } from '@/lib/actions';
import { Client } from '@/lib/schema';
import DataTable from '@/components/DataTable';
import DeleteButton from '@/components/DeleteButton';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [estado, setEstado] = useState('all');

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await getClients(
          search || undefined,
          sector === 'all' ? undefined : sector,
          estado === 'all' ? undefined : estado
        );
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadClients, 300);
    return () => clearTimeout(timer);
  }, [search, sector, estado]);

  const handleDelete = async (id: number, nombre: string) => {
    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Nombre del cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="all">Todos</option>
              <option value="Contabilidad">Contabilidad</option>
              <option value="Legal">Legal</option>
              <option value="General">General</option>
              <option value="ISLR">ISLR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="all">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Prepago">Prepago</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : (
        <DataTable
          columns={[
            { label: 'Nombre', key: 'nombre' },
            { label: 'Sector', key: 'sector' },
            {
              label: 'Total Facturado',
              key: 'totalFacturado',
              render: (item) => formatCurrency(item.totalFacturado),
            },
            {
              label: 'Total Cobrado',
              key: 'totalCobrado',
              render: (item) => formatCurrency(item.totalCobrado),
            },
            {
              label: 'Pendiente',
              key: 'totalPendiente',
              render: (item) => formatCurrency(item.totalPendiente),
            },
            { label: 'Estado', key: 'estado' },
          ]}
          data={clients}
          actions={(client) => (
            <>
              <Link
                href={`/clients/${client.id}/edit`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Editar
              </Link>
              <DeleteButton
                onConfirm={() => handleDelete(client.id, client.nombre)}
                itemName={`a ${client.nombre}`}
              />
            </>
          )}
          emptyMessage="No se encontraron clientes"
        />
      )}
    </div>
  );
}
