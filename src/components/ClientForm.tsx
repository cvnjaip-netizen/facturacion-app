'use client';

import { useActionState } from 'react-dom/server';
import { useRouter } from 'next/navigation';
import { createClient, updateClient } from '@/lib/actions';
import { type Client } from '@/lib/schema';

interface ClientFormProps {
  client?: Client;
  isEditing?: boolean;
}

export default function ClientForm({ client, isEditing }: ClientFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(async (formData: FormData) => {
    const data = {
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as string,
      sector: formData.get('sector') as string,
      rif: formData.get('rif') as string | null,
      observaciones: formData.get('observaciones') as string | null,
    };

    try {
      if (isEditing && client?.id) {
        await updateClient(client.id, data);
      } else {
        await createClient(data);
      }
      router.push('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
    }
  });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Ãšmbre</label>
        <input
          type="text"
          name="nombre"
          defaultValue={client?.nombre}
          required
          className="width-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <input
          type="text"
          name="tipo"
          defaultValue={client?.tipo}
          className="width-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sector</label>
        <select
          name="sector"
          defaultValue={client?.sector}
          required
          className="width-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        >
          <option value"="">Seleccionar Sector</option>
          <option value="Contabilidad">Contabilidad</option>
          <option value="Legal">Legal</option>
          <option value="General">General</option>
          <option value="ISLR">ISLR</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">RIF</label>
        <input
          type="text"
          name="rif"
          defaultValue={client?.rif || ''}
          className="width-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          name="observaciones"
          defaultValue={client?.observaciones || ''}
          className="width-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <button
   "•rÁpe ="submit"
        disabled={state.pending}
        className="width-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
  ìİ]Kœ[™[™ÈÈ	ÔØ]š[™Ë‹‹‰Èˆ	ÑİX\™\‰ÊBˆØ]Û‚ˆÙ›Ü›O‚ˆ
NÂŸB