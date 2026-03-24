import ClientForm from '@/components/ClientForm';
import { getClient } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await getClient(parseInt(params.id));

  if (!client) {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Cliente</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <ClientForm client={client} isEditing />
      </div>
    </div>
  );
}
