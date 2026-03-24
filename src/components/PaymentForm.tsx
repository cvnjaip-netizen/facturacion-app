'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPayment, updatePayment, getClients } from '@/lib/actions';
import { Payment, Client } from '@/lib/schema';
import Link from 'next/link';
import { useEffect } from 'react';

interface PaymentFormProps {
  payment?: Payment;
  clients: Client[];
  isEditing?: boolean;
}

export default function PaymentForm({ payment, clients, isEditing = false }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    try {
      const data = {
        clientId: parseInt(formData.get('clientId') as string),
        fecha: formData.get('fecha') as string,
        monto: formData.get('monto') as string,
        formaPago: formData.get('formaPago') as string,
        banco: (formData.get('banco') as string) || undefined,
        referencia: (formData.get('referencia') as string) || undefined,
        confirmado: formData.get('confirmado') === 'on',
        observaciones: (formData.get('observaciones') as string) || undefined,
      };

      if (isEditing && payment) {
        await updatePayment(payment.id, data);
      } else {
        await createPayment(data);
      }

      router.push('/payments');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cliente *
        </label>
        <select
          name="clientId"
          defaultValue={payment?.clientId || ''}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="">Seleccionar cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            defaultValue={payment?.fecha || ''}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <input
            type="number"
            name="monto"
            defaultValue={payment?.monto || ''}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Forma de Pago *
        </label>
        <select
          name="formaPago"
          defaultValue={payment?.formaPago || ''}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value="">Seleccionar forma de pago</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Punto de venta">Punto de venta</option>
          <option value="Zelle">Zelle</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banco
          </label>
          <input
            type="text"
            name="banco"
            defaultValue={payment?.banco || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referencia
          </label>
          <input
            type="text"
            name="referencia"
            defaultValue={payment?.referencia || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="confirmado"
          id="confirmado"
          defaultChecked={payment?.confirmado || false}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="confirmado" className="ml-2 text-sm text-gray-700 cursor-pointer">
          Confirmado
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          defaultValue={payment?.observaciones || ''}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Link
          href="/payments"
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
