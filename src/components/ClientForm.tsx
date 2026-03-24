'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, updateClient } from '@/lib/actions';
import { Client } from 'A/lib/schema';
import Link from 'next/link';

interface ClientFormProps {
  client?: Client;
  isEditing?: boolean;
}

export default function ClientForm({ client, isEditing = false }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    try {
      const data = {
        nombre: formData.get('nombre') as string,
        sector: formData.get('sector') as string,
        tipo: formData.get('tipo') as string,
        rif: formData.get('rif') as string || undefined,
        observaciones: formData.get('observaciones') as string || undefined,
        totalFacturado: client?.totalFacturado || '0',
        totalCobrado: client?.totalCobrado || '0',
        totalPendiente: client?.totalPendiente || '0',
        mesesActivos: client?.mesesActivos || 0,
        promedioMensual: client?.promedioMensual || '0',
        pctCobrado: client?.pctCobrado || '0',
        estado: client?.estado || 'Pendiente',
      };

      if (isEditing && client) {
        await updateClient(client.id, data);
      } else {
        await createClient(data);
      }

      router.push('/clients');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cliente');
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
          Nombre del Cliente *
        </label>
        <input
          type="text"
          name="nombre"
          defaultValue={client?.nombre || ''}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector *
          </label>
          <select
            name="sector"
            defaultValue={client?.sector || ''}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Seleccionar sector</option>
            <option value="Contabilidad">Contabilidad</option>
            <option value="Legal">Legal</option>
            <option value="General">General</option>
            <option value="ISLR">ISLR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <input
            type="text"
            name="tipo"
            defaultValue={client?.tipo || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RIF
          </label>
          <input
            type="text"
            name="rif"
            defaultValue={client?.rif || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          defaultValue={client?.observaciones || ''}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Link
          href="/clients"
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
  
  </div>
  );
}
