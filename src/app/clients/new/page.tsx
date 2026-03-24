import ClientForm from '@/components/ClientForm';

export default function NewClientPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Cliente</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <ClientForm />
      </div>
    </div>
  );
}
