'use client';

import { useEffect, useState } from 'react';
import { getPayments, deletePayment, getClients } from '@/lib/actions';
import { Payment, Client } from '@/lib/schema';
import DataTable from '@/components/DataTable';
import DeleteButton from '@/components/DeleteButton';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [paymentsData, clientsData] = await Promise.all([
          getPayments(undefined, search || undefined),
          getClients(),
        ]);
        setPayments(paymentsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    try {
      await deletePayment(id);
      setPayments(payments.filter((p) => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Pago
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Cliente
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : (
        <DataTable
          columns={[
            { label: 'Cliente', key: 'clientName' },
            { label: 'Fecha', key: 'fecha' },
            {
              label: 'Monto',
              key: 'monto',
              render: (item) => formatCurrency(item.monto),
            },
            { label: 'Forma de Pago', key: 'formaPago' },
            { label: 'Banco', key: 'banco' },
            { label: 'Referencia', key: 'referencia' },
            {
              label: 'Confirmado',
              key: 'confirmado',
              render: (item) => (item.confirmado ? '✓' : '-'),
            },
          ]}
          data={payments}
          actions={(payment) => (
            <>
              <Link
                href={`/payments/${payment.id}/edit`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Editar
              </Link>
              <DeleteButton
                onConfirm={() => handleDelete(payment.id)}
                itemName={`el pago del ${payment.fecha}`}
              />
            </>
          )}
          emptyMessage="No se encontraron pagos"
        />
      )}
    </div>
  );
}
